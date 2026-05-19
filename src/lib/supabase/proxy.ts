import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';


/**
 * Refreshes the Supabase auth session on every request.
 * 
 * Called from `src/proxy.ts` (the Next.js entry point).
 * Reads the current session cookie, refreshes the access token if it's expired or about to expire.
 * Propagates the new cookies to both the ongoing request and the outgoing response.
 */
async function updateSession(request: NextRequest, response: NextResponse ) {
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

    // IMPORTANT: This is what actually triggers the refresh.
    // `getUser()` verifies the token against Supabase's servers
    // If it's expired or near expiry, Supabase internally calls `setAll` with the new tokens.
    await supabase.auth.getUser();

    return supabaseResponse;
}


export { updateSession };