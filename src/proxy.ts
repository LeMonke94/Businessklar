// IMPORTANT: Exports must be inline (export async function, export const).
// Next.js statically analyzes this file at build time and does not follow re-exports.
import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/proxy';
import { locales, defaultLocale } from '@/config/i18n'


// The i18n middleware handles locale detection, URL parsing, and redirects.
// Built once at module load with our locale configuration — reused per request.
const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always',
});

export async function proxy(request: NextRequest) {
    // Step 1: Run i18n middleware.
    // This determines the locale from the URL and may produce a redirect (e.g. / → /de). Returns a NextResponse.
    const response = intlMiddleware(request);

    // Step 2: Refresh Supabase session on top of the i18n response.
    // Cookies get attached to whatever response i18n produced
    // preserving redirects while still keeping auth fresh.
    return await updateSession(request, response);
}

export const config = {
    matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};