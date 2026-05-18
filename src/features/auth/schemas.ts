/**
 * Zod schemas for auth form inputs.
 * 
 * One source of truth: each schema validates runtime data and exports a TypeScript type derived from itself.
 * Used by:
 * - React Hook Form for form validation
 * - authService for input validation before calling the provider
 */

import { z } from 'zod';


const signInSchema = z.object({
    email: z.email(),
    password: z.string().min(12),
});

const signUpSchema = z.object({
    email: z.email(),
    password: z.string().min(12).max(72),
    name: z.string().min(1).max(100).optional(),
});

type SignInInput = z.infer<typeof signInSchema>;
type SignUpInput = z.infer<typeof signUpSchema>;


export { signInSchema, signUpSchema };
export type { SignInInput, SignUpInput };