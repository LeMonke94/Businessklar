/**
 * Single source of truth for supported locales.
 * 
 * To add a new language: add the locale code to the `locales` array below,
 * then create a matching JSON file in `/messages/<code>.json`.
 * The Locale type updates automatically.
 */

// `as const` makes the type `readonly ['de', 'en', 'ru']` instead of `string[]`
// same for the literal 'de' instead of string
const locales = ['de', 'en', 'ru'] as const;
const defaultLocale = 'de' as const;

// Derives the union type `'de' | 'en' | 'ru'` from the `locales` array.
type Locale = (typeof locales)[number];

// Type guard: confirms an unknown string is a valid Locale.
function isLocale(value: string): value is Locale {
    return (locales as readonly string[]).includes(value);
}


export { locales, defaultLocale, isLocale };
export type { Locale };