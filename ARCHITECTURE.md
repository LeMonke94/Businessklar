# Architecture

Living document. Captures the structural decisions behind BusinessKlar and the reasoning behind them.

---

## Table of contents

- [Layers and dependency direction](#layers-and-dependency-direction)
- [Supabase: three clients, one cookie](#supabase-three-clients-one-cookie)

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
The cookie is the source of truth — refresh it, and the user stays logged in. Loose it, and they're logged out.
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