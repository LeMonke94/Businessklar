/**
 * ActivityDetectionEngine — port (contract) for turning a free-text activity
 * description into a category + Berufsgenossenschaft + Freiberufler signal.
 *
 * Local adapter (Etappe 9.3): keyword matching against the legacy ACTIVITIES
 * keyword sets. Could later be swapped for a semantic / LLM-backed service —
 * hence the async signatures and Result wrapping.
 *
 * Pure contract: no React, no DOM, no Supabase.
 */

import type { ActivityDetection } from '@/features/questionnaire/types';
import type { Result } from './types';


/** One autocomplete suggestion: the matched keyword + what it would detect. */
type ActivitySuggestion = {
    term: string;
    detection: ActivityDetection;
};

type ActivityDetectionEngine = {
    /**
     * Detect category / BG / Freiberufler eligibility from free text.
     * Resolves to `null` when nothing matches confidently — a normal outcome,
     * not an error (errors are reserved for a failing service impl).
     */
    detect: (text: string) => Promise<Result<ActivityDetection | null>>;

    /**
     * Autocomplete suggestions for the activity input. Legacy caps the list at
     * six; the adapter keeps that behaviour.
     */
    search: (query: string) => Promise<Result<ActivitySuggestion[]>>;
};


export type { ActivitySuggestion, ActivityDetectionEngine };