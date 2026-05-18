/**
 * Auth domain types - our own shapes, independent of any auth provider.
 * 
 * The supabase-provider in lib/auth/ translates between Supabase's types and these.
 * The rest of the app only sees these types, never Supabase's.
 * This allows us to swap providers without breaking UI code.
 */

type User = {
    id: string;
    email: string;
    name: string | null;
    locale: string | null;
    createdAt: string;
};


type Session = {
    user: User;
    expiresAt: number;
};


type AuthErrorCode =
    | 'invalid_credentials'
    | 'email_not_confirmed'
    | 'user_already_exists'
    | 'weak_password'
    | 'rate_limited'
    | 'network_error'
    | 'unknown';


type AuthError = {
    code: AuthErrorCode;
    message: string;
};


type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: AuthError };


export type { User, Session, AuthError, AuthErrorCode, Result };