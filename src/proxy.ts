// IMPORTANT: Exports must be inline (export async function, export const).
// Next.js statically analyzes this file at build time and does not follow re-exports.
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';


export async function proxy(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};