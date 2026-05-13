import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/config/env';


/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions. 
 * Reads cookies from the incoming request via Next.js's `cookies()` helper.
 * Must be awaited because `cookies()` is async in Next.js 15+.
 */
async function createClient() {
    // Get cookies
    const cookieStore = await cookies();
    
    // Create Server Client
    const client = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            // Tells Supabase HOW to read and write cookies in this context.
            cookies: {
                // Called by Supabase whenever it needs to read the current session cookies.
                getAll() {
                    return cookieStore.getAll();
                },
                // Called by Supabase whenever it needs to update cookies.
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => 
                            cookieStore.set(name, value, options),
                        );
                    } catch {
                        // Server Components are not allowed to mutate cookies - Next.js throws here.
                        // Safe to ignore: the proxy refreshes sessions on every request, 
                        // so cookies are already up-to-date by the time a Server Component renders.
                    }
                },
            },
        },
    );

    return client;
}


export { createClient };