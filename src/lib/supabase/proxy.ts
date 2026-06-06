import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';


// How long to wait for Supabase to verify/refresh the session before giving up.
// A reachable project answers well under this; the cap stops an unreachable or
// paused project from blocking every page for ~25s of internal auth retries.
const REFRESH_TIMEOUT_MS = 2500;


// True when the request carries a Supabase auth cookie (chunked or not).
// Anonymous visitors have none, so there is no session to refresh.
function hasAuthCookie(request: NextRequest): boolean {
    return request.cookies
        .getAll()
        .some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'));
}


/**
 * Refreshes the Supabase auth session on every request.
 *
 * Called from `src/proxy.ts` (the Next.js entry point).
 * Reads the current session cookie, refreshes the access token if it's expired or about to expire.
 * Propagates the new cookies to both the ongoing request and the outgoing response.
 *
 * Two guards keep the whole site from depending on Supabase being reachable:
 * anonymous requests (no auth cookie) skip the network entirely, and the refresh
 * itself is time-bounded so a slow or paused backend can't stall the request.
 */
async function updateSession(request: NextRequest, response: NextResponse ) {
    // Anonymous request: nothing to refresh, so don't touch the network. Public
    // pages then load even when Supabase is paused or unreachable.
    if (!hasAuthCookie(request)) {
        return response;
    }

    let supabaseResponse = response;

    // Create Server Client
    const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            // Tells Supabase HOW to read and write cookies in this context.
            cookies: {
                // Read cookies straight from the incoming request.
                getAll() {
                    return request.cookies.getAll();
                },
                // Called when Supabase refreshes the token and needs to persist the new cookies.
                setAll(cookiesToSet) {
                    // Update the request so any Server Component / Route Handler running after this proxy sees the fresh cookies.
                    cookiesToSet.forEach(({ name, value }) => 
                        request.cookies.set(name, value)
                    );

                    // Attach cookies to the existing response (don't rebuild it) (This is for the Browser)
                    // The response may already be a redirect from i18n - rebuilding would lose that.
                    cookiesToSet.forEach(({ name, value, options }) => 
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        },
    );

    // IMPORTANT: `getUser()` is what actually triggers the refresh — it verifies
    // the token against Supabase's servers and, if it's near expiry, internally
    // calls `setAll` with the new tokens.
    //
    // Bound the wait: a reachable project answers fast, but an unreachable or
    // paused one would otherwise retry internally for ~25s and stall the page.
    // The wrapped promise resolves on success OR failure (we only cap how long
    // we wait); on timeout we proceed without refreshing this request, and the
    // token is simply re-checked on the next one.
    const refresh = supabase.auth.getUser().then(() => undefined, () => undefined);
    await Promise.race([
        refresh,
        new Promise<void>((resolve) => {
            setTimeout(resolve, REFRESH_TIMEOUT_MS);
        }),
    ]);

    return supabaseResponse;
}


export { updateSession };