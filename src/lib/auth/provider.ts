/**
 * Auth provider interface — the contract any auth implementation must fulfill.
 * 
 * The app's authService talks to this interface, not to a specific provider.
 * Currently implemented by supabase-provider.ts.
 * Can be swapped out.
 * 
 * Methods return Result<T> rather than throwing, so the caller handles success and failure as data, not exceptions.
 */

import type { Session, Result } from '@/features/auth/types';


type SignInInput = {
    email: string;
    password: string;
};

type SignUpInput = {
    email: string;
    password: string;
    name?: string;
};

type AuthProvider = {
    // Create a new Account.
    signUp: (input: SignUpInput) => Promise<Result<Session>>;

    // Sign in an existing user with email and password.
    signIn: (input: SignInInput) => Promise<Result<Session>>;

    // Sign out the current user. Always succeeds, but returns Result for consistency.
    signOut: () => Promise<Result<void>>;

    // Get the current session, if any. Returns null if not signed in.
    getSession: () => Promise<Session | null>;

    // Request a password reset email. The actual reset happens via a link the user clicks.
    resetPassword: (email: string) => Promise<Result<void>>;

    // Subscribe to auth state changes (sign in, sign out, token refresh).
    // Returns an unsubscribe function.
    onAuthChange: (callback: (session: Session | null) => void) => () => void;
}


export type { AuthProvider, SignInInput, SignUpInput };