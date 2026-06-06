/**
 * Detects a Supabase auth-token cookie by name.
 *
 * @supabase/ssr stores the session in a cookie named `sb-<project-ref>-auth-token`
 * (split into `.0`, `.1`, … chunks when large). Its presence is a cheap, network-free
 * signal that the request *might* carry a session — used to skip Supabase calls
 * entirely for anonymous requests (the proxy session refresh, the dashboard gate).
 *
 * Presence does NOT prove the session is valid; it only means "worth verifying".
 */
function isSupabaseAuthCookie(name: string): boolean {
    return name.startsWith('sb-') && name.includes('auth-token');
}


export { isSupabaseAuthCookie };
