/**
 * Auth service — the API the rest of the app uses for authentication.
 *
 * Sits between UI components and the AuthProvider. Validates inputs with
 * Zod before delegating to the provider. Returns Result<T> consistently.
 *
 * Why this layer:
 * - Defense in depth: React Hook Form validates on submit, but the service
 *   re-validates before calling the provider, catching any code paths that
 *   bypass form validation.
 * - Single source of truth: any new auth-using code imports authService,
 *   not the provider directly.
 */

import { signInSchema, signUpSchema } from '@/features/auth/schemas';
import type { SignInInput, SignUpInput } from '@/features/auth/schemas';
import type { Session, Result, AuthError } from '@/features/auth/types';
import { authProvider } from '@/lib/auth';

/**
 * Build a Result<T> failure with a generic validation error.
 *
 * Zod's error format is detailed, but for the service layer we collapse
 * it to a single error message. UI-level validation (React Hook Form)
 * gives field-level errors; this is just the safety net.
 */
function validationError(message: string): { ok: false; error: AuthError } {
    return {
        ok: false,
        error: {
            code: 'unknown',
            message,
        },
    };
}

const authService = {
    async signIn(input: SignInInput): Promise<Result<Session>> {
        const validation = signInSchema.safeParse(input);

        if (!validation.success) {
            return validationError('Invalid sign-in input');
        }

        return authProvider.signIn(validation.data);
    },

    async signUp(input: SignUpInput): Promise<Result<Session>> {
        const validation = signUpSchema.safeParse(input);

        if (!validation.success) {
            return validationError('Invalid sign-up input');
        }

        return authProvider.signUp(validation.data);
    },

    async signOut(): Promise<Result<void>> {
        return authProvider.signOut();
    },

    async getSession(): Promise<Session | null> {
        return authProvider.getSession();
    },

    async resetPassword(email: string): Promise<Result<void>> {
        // Minimal validation — just check it looks like an email.
        if (!email.includes('@')) {
            return validationError('Invalid email');
        }

        return authProvider.resetPassword(email);
    },

    onAuthChange(callback: (session: Session | null) => void): () => void {
        return authProvider.onAuthChange(callback);
    },
};

export { authService };