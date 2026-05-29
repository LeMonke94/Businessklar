/**
 * Shared result/error types for the rule engines.
 *
 * Mirrors the Result pattern from `features/auth/types`: errors are data, not
 * exceptions, and every engine method returns Result<T>. Local engine impls
 * never fail, but a future server / LLM-backed impl can — Result lets it report
 * that without changing any signature.
 *
 * Kept separate from the auth Result on purpose: that one is tied to AuthError,
 * this one to RuleError. If we ever want a single generic Result<T, E> we can
 * lift one out later — not worth it for two domains.
 */

type RuleErrorCode =
    | 'invalid_input'
    | 'service_unavailable'
    | 'unknown';

type RuleError = {
    code: RuleErrorCode;
    message: string;
};

type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: RuleError };


export type { RuleErrorCode, RuleError, Result };