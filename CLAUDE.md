# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm only** — the lockfile is pnpm-specific; `npm install`/`yarn` will produce incorrect results.

```bash
pnpm install      # install dependencies
pnpm dev          # dev server at http://localhost:3000 (uses --webpack, see below)
pnpm build        # production build (uses Turbopack)
pnpm start        # serve the production build
pnpm lint         # ESLint (eslint-config-next: core-web-vitals + typescript)
```

There is no test runner configured yet. The README lists Vitest + Playwright as the *intended* stack, but no test deps or scripts exist — do not assume `pnpm test` works.

**Dev runs on Webpack on purpose** (`next dev --webpack`). Turbopack has a cache-invalidation bug with the `next-intl` `[locale]` dynamic-segment + minimal-root-layout pattern this project uses. The bug only affects HMR in dev; production builds still use Turbopack. Don't "fix" this by removing the `--webpack` flag.

## Documentation map

Two living docs hold the detail — read them before non-trivial work and keep them in sync with changes:

- **ARCHITECTURE.md** — the "why" behind every structural decision (the three Supabase clients, auth abstraction, `Result<T>`, TanStack Query as session state, i18n, content-as-code, Zod). This is the canonical architecture reference.
- **AGENTS.md** — code style and conventions for both humans and coding assistants.

The README's "Planned Architecture" and "Tech-Stack" sections describe the target, not the current state. Only `auth` and `glossary` features exist so far; there are no API routes, and `business-case`/`marketplace`/`compliance`/`conversations` are not yet built.

## Conventions (from AGENTS.md)

- 4-space indentation, single quotes, always semicolons, trailing commas in multi-line literals.
- **No Prettier** — formatting is intentional and manual. Don't add an auto-formatter or reformat files wholesale.
- One top-level component/function per file; filename matches the primary export (`Header.tsx` → `Header`).
- Each component lives in its own folder with a co-located `*.module.css` and an `index.ts` re-export. Styling is **CSS Modules** + design tokens in `src/styles/tokens.css`.
- Import alias: `@/*` → `src/*`.

## Architecture essentials

**Layered, with a strict downward-only dependency rule:**

```
app/         Routing only. Pages validate params, call services, render components.
features/    Product logic, self-contained per feature (components/hooks/services/schemas/types).
components/  Dumb, reusable UI primitives (ui/, layout/, sections/, providers/). No business logic.
lib/         Infrastructure adapters (Supabase, auth). Must NEVER import from features/ or app/.
```

This rule is what makes vendor swaps possible — keep it intact.

**Supabase is accessed through three clients, never directly elsewhere.** `lib/supabase/client.ts` (browser), `server.ts` (Server Components/Route Handlers), `proxy.ts` (per-request middleware). Outside `lib/supabase/` and `lib/auth/`, no file should `import '@supabase/...'` — add a service method instead.

**Auth is abstracted behind a vendor-agnostic interface.** UI → `features/auth/services/authService.ts` → `lib/auth` (`authProvider`, the only place that knows Supabase exists) → `lib/auth/supabase-provider.ts`. The provider translates Supabase types/errors into domain types (`User`, `Session`, `AuthErrorCode`) so Supabase leaks stop at that boundary. Swapping providers = changing the one export in `lib/auth/index.ts`.

**Errors are data, not exceptions.** Auth operations return `Result<T> = { ok: true; data } | { ok: false; error }`. No auth method throws; callers check `result.ok`.

**Client-side session state lives in TanStack Query** under the key `['session']` (`features/auth/hooks/useAuth.ts`), synced via `authProvider.onAuthChange`. Server Components instead call the Supabase server client directly.

**Zod schemas are the single source of truth** (`features/auth/schemas.ts`): one schema drives React Hook Form validation, service-layer re-validation (defense in depth), and the inferred TS types. Validate again in the service even though the form already validated.

## i18n gotchas

- Every route is nested under `app/[locale]/`; locales are `de` (default), `en`, `ru`, defined once in `src/config/i18n.ts`. Adding a language = add the code to `locales` + create `messages/<code>.json`.
- `generateStaticParams()` in `[locale]/layout.tsx` pre-renders all locales at build time.
- **Every page re-validates the locale** with `isLocale(locale)` after `await params` and calls `notFound()` if invalid — intentional redundancy on top of the middleware. Keep this pattern on new pages.
- Translation text lives in `messages/*.json` (typed keys). Glossary/fines *structure* lives in code (`features/glossary/structure.ts`, `fines.ts`); legal citations (`law` field) are verbatim and never translated.

## Two files Next.js statically analyzes — edit with care

- **`src/proxy.ts`** is this project's middleware (Next.js 16 renamed `middleware.ts` → `proxy.ts`). Exports must be **inline** (`export async function`, `export const`); Next does not follow re-exports here. It chains `next-intl` middleware with Supabase session refresh (`updateSession`).
- **`src/config/env.ts`** validates env vars at startup via `@t3-oss/env-nextjs` + Zod. `NEXT_PUBLIC_*` vars must be listed in `runtimeEnv` explicitly (Next inlines them at build time, so dynamic lookup fails in the browser). Missing/malformed required vars fail the build/start with a clear error. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
