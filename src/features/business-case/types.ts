/**
 * Domain types for the business-case feature.
 *
 * A "business case" is a saved questionnaire run: the user's survey answers
 * plus the report metadata produced from them. The Dashboard lists these.
 *
 * These are our own shapes, independent of the Supabase row layout. The
 * service translates Supabase rows into these types so the database schema
 * never leaks above the service — the same boundary the auth feature draws.
 */

import type { SurveyAnswers } from '@/features/questionnaire/types';


/**
 * Normalized case status. The legacy table stores free-form strings
 * ('completed', 'done', 'draft', …); the service collapses them to these
 * three so the UI localizes a fixed set.
 */
type CaseStatus = 'completed' | 'draft' | 'saved';


/** One saved case as the Dashboard needs it. */
type BusinessCase = {
    id: string;
    // Best available human title from the saved data, or null when none was
    // stored. The UI shows a localized fallback for null.
    title: string | null;
    status: CaseStatus;
    createdAt: string;
    updatedAt: string | null;
    isShared: boolean;
    shareToken: string | null;
    // The survey answers this case was built from, already normalized to the
    // questionnaire's domain shape so "Open" can rehydrate the report directly.
    answers: SurveyAnswers;
};


type CaseErrorCode =
    | 'not_authenticated'
    | 'load_failed'
    | 'delete_failed'
    | 'share_failed'
    | 'save_failed';

type CaseError = {
    code: CaseErrorCode;
    message: string;
};


/** Errors are data, not exceptions — mirrors the auth feature's Result<T>. */
type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: CaseError };


/**
 * Input for saving a freshly completed report as a new case. The service
 * derives the denormalized columns from `answers`; the caller only supplies
 * the report-level facts the answers don't carry (the recommended legal form
 * and the locale the report was viewed in).
 */
type NewCaseInput = {
    answers: SurveyAnswers;
    legalFormKey: string;
    legalFormLabel: string;
    sourceLang: string;
};


export type { BusinessCase, CaseStatus, CaseError, CaseErrorCode, Result, NewCaseInput };
