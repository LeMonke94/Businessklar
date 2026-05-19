## Dev server

We use Webpack (`next dev --webpack`) instead of Turbopack in development.
Turbopack has a known cache-invalidation bug with the next-intl `[locale]`
dynamic segment + minimal root layout pattern that we use. Production
builds (`next build`) still use Turbopack — the bug only affects HMR in dev.

# AGENTS.md

Code style and conventions for the BusinessKlar rebuild. Coding assistants
(Claude, Copilot, Cursor) and human contributors should follow these rules.

---

## Formatting

- **Indentation**: 4 spaces (configured in `.vscode/settings.json`)
- **Quotes**: single quotes for strings (`'foo'`, not `"foo"`)
- **Semicolons**: always at end of statements
- **Trailing commas**: yes, in multi-line objects, arrays, and parameter lists
- **Line length**: no hard limit, but break lines that hurt readability (~100 chars)
- **No Prettier**: the project intentionally avoids auto-formatting

## File Structure

- One top-level component or function per file
- File names match the primary export: `Header.tsx` exports `Header`
- CSS Modules co-located with components: `Header/Header.module.css`
- Each component in its own folder with `index.ts` re-export: