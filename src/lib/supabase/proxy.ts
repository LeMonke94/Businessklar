import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';


/**
 * Refreshes the Supabase auth session on every request.
 * 
 * Called from `src/proxy.ts` (the Next.js entry point).
 * Reads the current session cookie, refreshes the access token if it's expired or about to expire.
 * Propogates the new cookies to both the ongiong request and the outgoing response.
 */
async function updateSession(request: NextRequest) {
    // Default Response: request will continue to the next handler
    let supabaseResponse = NextResponse.next({ request });

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
                    // Sets new cookies on the Request (This is for the Server)
                    cookiesToSet.forEach(({ name, value }) => 
                        request.cookies.set(name, value)
                    );

                    // Rebuilds the response around the now-updated request.
                    supabaseResponse = NextResponse.next({ request });

                    // Attach the cookies to the response (This is for the Browser).
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