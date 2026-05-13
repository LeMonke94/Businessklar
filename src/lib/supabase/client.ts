import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/config/env';


/**
 * Creates a Supabase client for Client Components and browser-side code.
 * Reads cookies via document.cookie automatically.
 */
function createClient() {
    return createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
}


export { createClient };