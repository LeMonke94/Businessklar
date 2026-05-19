/**
 * Public API for the auth module.
 *
 * Consumers import from '@/lib/auth' rather than reaching into specific files.
 * To swap providers (e.g. to Clerk or Auth.js), change the export below —
 * nothing else in the codebase needs to change.
 */

import { createSupabaseAuthProvider } from './supabase-provider';

const authProvider = createSupabaseAuthProvider();

export { authProvider };
export type { AuthProvider, SignInInput, SignUpInput } from './provider';