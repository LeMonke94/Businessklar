/**
 * Supabase implementation of the AuthProvider interface.
 *
 * This is the ONLY file in the codebase that knows about Supabase's auth API.
 * Everything else works through the AuthProvider interface and stays
 * provider-agnostic.
 *
 * Responsibilities:
 * - Translate between Supabase's types and our domain types (User, Session)
 * - Map Supabase's string-based errors to our stable AuthErrorCode union
 * - Wrap Supabase responses in our Result<T> pattern
 */

import type {
    AuthError as SupabaseAuthError,
    Session as SupabaseSession,
    User as SupabaseUser,
} from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Session, User, AuthError, AuthErrorCode, Result } from '@/features/auth/types';
import type { AuthProvider, SignInInput, SignUpInput } from './provider';


// ============================================================================
// Translation helpers
// ============================================================================

// Maps a Supabase user to our domain User type.
// Pulls relevant fields out, drops Supabase-internal metadata.
function toUser(supabaseUser: SupabaseUser): User {
    return {
        id: supabaseUser.id,
        // Supabase types email as optional, but auth requires it — assert non-null.
        email: supabaseUser.email!,
        name: (supabaseUser.user_metadata?.name as string) ?? null,
        locale: (supabaseUser.user_metadata?.locale as string) ?? null,
        createdAt: supabaseUser.created_at,
    };
}

// Maps a Supabase session to our domain Session type.
function toSession(supabaseSession: SupabaseSession): Session {
    return {
        user: toUser(supabaseSession.user),
        // Supabase gives expires_at in seconds; we store as ms for consistency.
        expiresAt: (supabaseSession.expires_at ?? 0) * 1000,
    };
}

// Translates Supabase error messages into our stable AuthErrorCode union.
// String-matching is fragile (Supabase could change wording), so this function is the single point of maintenance.
// If Supabase changes a message, update the pattern here, nothing else changes.
function toAuthError(error: SupabaseAuthError): AuthError {
    const message = error.message.toLowerCase();

    let code: AuthErrorCode = 'unknown';

    if (message.includes('invalid login credentials')) {
        code = 'invalid_credentials';
    } else if (message.includes('email not confirmed')) {
        code = 'email_not_confirmed';
    } else if (message.includes('user already registered')) {
        code = 'user_already_exists';
    } else if (message.includes('password') && message.includes('weak')) {
        code = 'weak_password';
    } else if (message.includes('rate limit')) {
        code = 'rate_limited';
    } else if (message.includes('network') || message.includes('fetch')) {
        code = 'network_error';
    }

    return {
        code,
        message: error.message,
    };
}


// ============================================================================
// Provider implementation
// ============================================================================

// Creates a Supabase-backed AuthProvider.
// Returns an object that satisfies the AuthProvider interface.
// The actual Supabase client is created lazily on first use.
function createSupabaseAuthProvider(): AuthProvider {
    const supabase = createClient();

    return {
        async signIn({ email, password }: SignInInput): Promise<Result<Session>> {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { ok: false, error: toAuthError(error) };
            }

            if (!data.session) {
                return {
                    ok: false,
                    error: { code: 'unknown', message: 'No session returned' },
                };
            }

            return { ok: true, data: toSession(data.session) };
        },

        async signUp({ email, password, name }: SignUpInput): Promise<Result<Session>> {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: name ? { name } : undefined,
                },
            });

            if (error) {
                return { ok: false, error: toAuthError(error) };
            }

            // Sign-up may not return a session if email confirmation is required.
            if (!data.session) {
                return {
                    ok: false,
                    error: {
                        code: 'email_not_confirmed',
                        message: 'Check your email to confirm your account',
                    },
                };
            }

            return { ok: true, data: toSession(data.session) };
        },

        async signOut(): Promise<Result<void>> {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return { ok: false, error: toAuthError(error) };
            }

            return { ok: true, data: undefined };
        },

        async getSession(): Promise<Session | null> {
            const { data } = await supabase.auth.getSession();

            if (!data.session) {
                return null;
            }

            return toSession(data.session);
        },

        async resetPassword(email: string): Promise<Result<void>> {
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                return { ok: false, error: toAuthError(error) };
            }

            return { ok: true, data: undefined };
        },

        onAuthChange(callback: (session: Session | null) => void): () => void {
            const { data: subscription } = supabase.auth.onAuthStateChange(
                (_event, supabaseSession) => {
                    callback(supabaseSession ? toSession(supabaseSession) : null);
                },
            );

            // Return an unsubscribe function — standard subscription pattern.
            return () => {
                subscription.subscription.unsubscribe();
            };
        },  
    };
}


export { createSupabaseAuthProvider };