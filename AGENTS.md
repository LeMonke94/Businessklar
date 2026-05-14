## Dev server

We use Webpack (`next dev --webpack`) instead of Turbopack in development.
Turbopack has a known cache-invalidation bug with the next-intl `[locale]`
dynamic segment + minimal root layout pattern that we use. Production
builds (`next build`) still use Turbopack — the bug only affects HMR in dev.