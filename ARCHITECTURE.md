# Architecture

Living document. Captures the structural decisions behind BusinessKlar and the reasoning behind them.

---

## Table of contents

- [Layers and dependency direction](#layers-and-dependency-direction)
- [Supabase: three clients, one cookie](#supabase-three-clients-one-cookie)
- [Auth abstraction](#auth-abstraction)
- [Result\<T\>: errors as data](#resultt-errors-as-data)
- [TanStack Query as session state](#tanstack-query-as-session-state)
- [i18n: locale routing and content keys](#i18n-locale-routing-and-content-keys)
- [Content-as-code: glossary and fines](#content-as-code-glossary-and-fines)
- [Zod as single source of truth](#zod-as-single-source-of-truth)

---

## Layers and dependency direction

The project is organized in layers.
Code in an inner layer must never import from an outer layer.

```
app/                <- Routing only. Pages call services, render components.
features/           <- Product logic. Each feature is self-contained.
components/         <- UI primitives. Dumb, reusable, no business logic.
lib/                <- Infrastructure. Adapters to external systems (Supabase, etc.).
```

The dependency arrow points downward: a Server Component in `app/` can import from `features/`, which can import from `components/` and `lib/`. 
Nothing in `lib/` is allowed to import from `features/` or `app/` - that would be the foundation depending on the kitchen.
This is the rule that makes vendor swaps possible. If Supabase ever gets replaced, the change is contained to `lib/`. Nothing above it needs to know.

---

## Supabase: three clients, one cookie

### What's happening

Supabase auth state lives in a single browser cookie (`sb-...-auth-token`). That cookie travels with every request the browser makes to our server. 
The cookie is the source of truth — refresh it, and the user stays logged in. Lose it, and they're logged out.
The cookie is the **same physical thing** across the whole app. What changes is **how we access it** depending on where our code is running.

---

### Why three files

Next.js App Router runs code in three different environments, and each one has its own API for reading cookies:

| File                         | Where it runs                                     | How it reads cookies                               |
|------------------------------|---------------------------------------------------|----------------------------------------------------|
| `lib/supabase/client.ts`     | In the browser (Client Components)                | `document.cookie` (handled internally by Supabase) |
| `lib/supabase/server.ts`     | On the server (Server Components, Route Handlers) | `cookies()` from `next/headers`                    |
| `lib/supabase/proxy.ts` | On the server, before every request (Proxy)  | `request.cookies`                                  |

All three return a Supabase client object with the same API (`supabase.auth.signIn()`, `supabase.from('...')`, etc.). 
What differs is the internal cookie strategy.

---

### The dependency injection pattern

Supabase itself doesn't know anything about Next.js. 
The `createServerClient` function takes a `cookies` object with two methods we define:

```ts
{
  cookies: {
    getAll() { /* return current cookies */ },
    setAll(cookiesToSet) { /* persist new cookies */ },
  }
}
```

Supabase calls these methods when it needs to read or write cookies. We tell it _how_, it tells us _when_. This is why the same Supabase package 
can work in Browser, Server, and Proxy contexts — the cookie strategy is injected, not hardcoded.

---

### The Proxy: why it's the most complex

The Proxy runs on **every request** before any Server Component or Route Handler. Its job: read the cookie, ask Supabase to verify it, refresh 
the token if it's expired or close to expiring, and propagate the result.

The tricky part is that a refreshed token has to be visible in two places at once:

1. **In the current request** — so Server Components rendering this page see the fresh token immediately.
2. **In the outgoing response** — so the browser stores the new cookie and sends it with the next request.

That's why `setAll` writes to both `request.cookies` and `supabaseResponse.cookies`. It's not duplication; it's two different lifecycles 
for the same data.

---

### The line that does all the work

```ts
await supabase.auth.getUser();
```

This is the actual trigger. Without it, all the cookie wiring above does nothing. `getUser()` verifies the token against Supabase's servers, and if 
it's expired or near-expiry, it internally calls our `setAll` function with the new cookies. Everything else in the file is setup for this single call.
`getSession()` would not work here — it only reads the cookie locally without verifying or refreshing. `getUser()` makes the actual roundtrip and 
triggers the refresh path.

---

### When a user first arrives

No cookie exists yet. The proxy still runs, calls `getUser()`, gets `null`, doesn't call `setAll` (nothing to write), and passes through. The 
user is anonymous. No cookies are conjured out of nowhere — that only happens after a real login, which goes through the auth provider 
(see [Auth abstraction](#auth-abstraction)).

---

### The rule of thumb

Outside of `lib/supabase/` and `lib/auth/`, no file should ever `import '@supabase/...'`. If you find yourself reaching for the Supabase client in a 
component or a feature, that's the signal to add a method to a service instead. This is what keeps the vendor swappable.

---

## Auth abstraction

### The three-layer model

Auth in this project is split into three layers, each with a distinct responsibility:

```
features/auth/services/authService.ts   <- Validates input, delegates to provider
lib/auth/provider.ts                    <- Vendor-agnostic interface (AuthProvider)
lib/auth/supabase-provider.ts           <- Supabase implementation of that interface
```

The `authService` validates form data with Zod before it touches the provider. If validation fails, it returns an error immediately — the provider never 
sees garbage input. If validation passes, it delegates to whatever `authProvider` is currently wired up.

`authProvider` is exported from `lib/auth/index.ts`. That export is the only place that knows Supabase is involved. Swapping to Clerk or Auth.js means 
changing one file, and the rest of the app is unaffected.

---

### Type translation

The Supabase provider doesn't expose Supabase's types upward. It translates everything into our own domain types before returning:

| Supabase type            | Our type          |
|--------------------------|-------------------|
| `SupabaseUser`           | `User`            |
| `SupabaseSession`        | `Session`         |
| Supabase error string    | `AuthErrorCode`   |

This is the boundary where Supabase leaks stop. Above `lib/auth/`, the rest of the app only knows about `User`, `Session`, and `AuthError`. 
The translation functions (`toUser`, `toSession`, `toAuthError`) live inside the provider file. Nothing outside needs them.

---

### The AuthProvider interface

```ts
interface AuthProvider {
  signUp(credentials: SignUpCredentials): Promise<Result<User>>;
  signIn(credentials: SignInCredentials): Promise<Result<Session>>;
  signOut(): Promise<Result<void>>;
  getSession(): Promise<Result<Session | null>>;
  resetPassword(email: string): Promise<Result<void>>;
  onAuthChange(callback: (user: User | null) => void): () => void;
}
```

Every method returns `Result<T>` (see below). No method throws. Errors are data.

---

## Result\<T\>: errors as data

### What it is

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AuthError };
```

Every auth operation returns a `Result`. Callers check `result.ok` before accessing the payload — no try/catch needed, no unhandled promise rejections, 
no guessing whether a function throws.

```ts
const result = await authService.signIn(credentials);
if (!result.ok) {
  // result.error.code tells you exactly what went wrong
  return;
}
// result.data is the Session
```

---

### Why not exceptions

Exceptions make the error path invisible. A function signature like `signIn(): Promise<Session>` tells you nothing about what can go wrong — 
you only find out at runtime, in production, when something breaks. `Result<T>` makes the failure path explicit in the type itself. 
Every caller is forced to handle it.

---

### Error codes

`AuthErrorCode` is a string union of every known failure mode:

```ts
type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'user_already_exists'
  | 'weak_password'
  | 'rate_limited'
  | 'network_error'
  | 'unknown';
```

The Supabase provider maps Supabase's raw error strings to these codes. Everything above `lib/auth/` works with these codes — 
they never see Supabase's internal error format. This is what allows components to display correct, specific error messages 
without coupling themselves to Supabase.

---

## TanStack Query as session state

### The problem with useEffect for auth

The naive approach to auth state in React is a `useEffect` that calls `getSession()` on mount and stores the result in `useState`. 
This has two problems: it doesn't stay in sync across browser tabs (if you sign out in one tab, the other still thinks you're signed in), 
and it doesn't deduplicate — every component that needs the session triggers its own fetch.

---

### How useAuth solves it

`useAuth` (in `features/auth/hooks/useAuth.ts`) wraps the session in a TanStack Query cache entry:

- **Single fetch, many readers.** Multiple components can call `useAuth()` simultaneously. TanStack Query deduplicates — one network call, 
  one cache entry, shared across all consumers.
- **Auth-event sync.** The hook subscribes to `authProvider.onAuthChange()` and invalidates the cache when Supabase fires an auth event 
  (sign-in, sign-out, token refresh). The session state updates automatically — no manual refetch, no stale UI.
- **Mutations as operations.** `signIn`, `signUp`, and `signOut` are TanStack Query mutations. They update the cache on success, 
  so any component using `useAuth()` re-renders with the correct state immediately.

---

### The cache key

```ts
const SESSION_QUERY_KEY = ['session'] as const;
```

All auth mutations invalidate `['session']` on success. This is the single source of truth for "is the user logged in?" in client-side code. 
Server Components don't use this — they call `getUser()` directly via the Supabase server client.

---

## i18n: locale routing and content keys

### How the locale gets into the URL

Every route is nested under `app/[locale]/`. The `[locale]` segment is a dynamic Next.js parameter that matches `de`, `en`, or `ru`. 
`generateStaticParams()` in `[locale]/layout.tsx` pre-renders all three variants at build time, so there is no runtime locale resolution for 
static pages.

The supported locales and their metadata (flag, native name) live in `config/i18n.ts`. The middleware in `proxy.ts` reads the user's browser 
locale and redirects bare paths (`/`) to the appropriate locale prefix (`/de/`).

---

### Defensive re-validation

The middleware validates the locale before handing control to the app. But each page still calls `isLocale()` on its own params — it doesn't 
trust the router to have done it. Next.js 15 passes params as a `Promise`, so:

```ts
const { locale } = await params;
if (!isLocale(locale)) notFound();
```

This pattern appears on every page. It's intentional redundancy: the middleware is the first gate, the page is the second. 
Neither trusts the other.

---

### Text lives in messages/, structure lives in code

Translation strings are in `messages/de.json`, `messages/en.json`, and `messages/ru.json`. Components call `getTranslations()` 
(server) or `useTranslations()` (client) from next-intl to access them by key. 

The keys are typed — next-intl infers the key namespace from the messages file, so a typo in a translation key is a TypeScript error, 
not a silent empty string at runtime.

---

## Content-as-code: glossary and fines

### The separation

The glossary is split into two concerns:

- **Structure** (`features/glossary/structure.ts`, `features/glossary/fines.ts`) — defines what categories exist, what terms belong 
  to each, and what fines are listed, including their legal references. No text, no translations — just keys and constants.
- **Content** (`messages/{locale}.json`) — holds the actual displayed text, one translation per locale.

The components render structure, look up text. Neither file knows about the other directly.

---

### Why this split

Reordering terms, adding a category, or moving a fine to a different section is a code change — one line in `structure.ts`. 
It doesn't require touching translation files or components. Changing the German text for a term is a content change — one line 
in `messages/de.json`. It doesn't require touching structure or components. The two concerns change at different rates and for 
different reasons; keeping them separate means changes stay small and localized.

---

### Fines: laws as constants

Each fine in `fines.ts` carries a `law` field — the German legal citation (e.g., `"§ 379 AO"`, `"§ 26b UStG"`). 
These are not translated. They're the same in every locale. Storing them in the structure file, not in the messages files, 
prevents accidental "translation" of legal references that must stay verbatim.

---

## Zod as single source of truth

### One schema, three uses

Auth forms define one Zod schema per operation:

```ts
// features/auth/schemas.ts
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});
export type SignInCredentials = z.infer<typeof signInSchema>;
```

That single schema is used in three places without duplication:

1. **React Hook Form** — `zodResolver(signInSchema)` drives field-level validation in the form component.
2. **authService** — `signInSchema.safeParse(credentials)` re-validates before the provider is called.
3. **TypeScript types** — `SignInCredentials` is inferred from the schema, not written by hand.

---

### Why double-validation

The form validates on the client. The service validates again before calling the provider. This isn't paranoia — it's defense in depth. 
If the form is ever bypassed (programmatic call, test, future API route), the service still rejects invalid input. 
The provider never receives data that hasn't passed Zod.

---