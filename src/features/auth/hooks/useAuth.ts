/**
 * useAuth — the primary hook for accessing authentication state.
 *
 * Combines a TanStack Query for the current session with mutations
 * for sign-in, sign-up, and sign-out. Subscribes to auth changes
 * (e.g. logout in another tab) to keep the cache in sync.
 *
 * Usage:
 *   const { session, user, isAuthenticated, signIn, signOut } = useAuth();
 */

'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/authService';
import type { Session, Result } from '@/features/auth/types';
import type { SignInInput, SignUpInput } from '@/features/auth/schemas';

const SESSION_KEY = ['auth', 'session'] as const;

function useAuth() {
    const queryClient = useQueryClient();

    // Query: current session. Cached, auto-refetched when window regains focus.
    const sessionQuery = useQuery({
        queryKey: SESSION_KEY,
        queryFn: () => authService.getSession(),
    });

    // Keep the cache in sync with auth state changes (e.g. logout in another tab).
    useEffect(() => {
        const unsubscribe = authService.onAuthChange((session) => {
            queryClient.setQueryData(SESSION_KEY, session);
        });

        return unsubscribe;
    }, [queryClient]);

    // Mutations: each one invalidates the session cache on success.
    const signInMutation = useMutation({
        mutationFn: (input: SignInInput) => authService.signIn(input),
        onSuccess: (result) => {
            if (result.ok) {
                queryClient.setQueryData(SESSION_KEY, result.data);
            }
        },
    });

    const signUpMutation = useMutation({
        mutationFn: (input: SignUpInput) => authService.signUp(input),
        onSuccess: (result) => {
            if (result.ok) {
                queryClient.setQueryData(SESSION_KEY, result.data);
            }
        },
    });

    const signOutMutation = useMutation({
        mutationFn: () => authService.signOut(),
        onSuccess: () => {
            queryClient.setQueryData(SESSION_KEY, null);
        },
    });

    const session = sessionQuery.data ?? null;
    const isLoading = sessionQuery.isLoading;
    const isAuthenticated = session !== null;

    return {
        // State
        session,
        user: session?.user ?? null,
        isAuthenticated,
        isLoading,

        // Actions — return Promise<Result<T>> so caller can react to outcome
        signIn: (input: SignInInput): Promise<Result<Session>> =>
            signInMutation.mutateAsync(input),
        signUp: (input: SignUpInput): Promise<Result<Session>> =>
            signUpMutation.mutateAsync(input),
        signOut: (): Promise<Result<void>> => signOutMutation.mutateAsync(),

        // Loading states for individual mutations
        isSigningIn: signInMutation.isPending,
        isSigningUp: signUpMutation.isPending,
        isSigningOut: signOutMutation.isPending,
    };
}

export { useAuth };