import type { ActivityDetectionEngine, ActivitySuggestion } from './activity-detection-engine';
import type { Result } from './types';
import type { ActivityDetection } from '@/features/questionnaire/types';
import { activityKeywords, type ActivityKeywordEntry } from './data/activity-keywords';


/**
 * Local ActivityDetectionEngine — keyword matching against the legacy
 * ACTIVITIES table. Pure: no React, no DOM, no network. A future server / LLM
 * implementation can replace this behind the same port without API changes,
 * which is why the methods are async and Result-wrapped even though the work
 * here is synchronous.
 */

function toDetection(entry: ActivityKeywordEntry): ActivityDetection {
    return {
        category: entry.category,
        bgCode: entry.bgCode,
        freiberuflerEligible: entry.freiberuflerEligible,
    };
}

function createLocalActivityDetectionEngine(): ActivityDetectionEngine {
    return {
        // Pick the entry whose longest matching keyword wins, matching both
        // directions (query in term, term in query) — exactly as the legacy
        // detectActivity did. Returns null when nothing matches.
        async detect(text: string): Promise<Result<ActivityDetection | null>> {
            const query = text.trim().toLowerCase();
            if (!query) {
                return { ok: true, data: null };
            }

            let best: ActivityKeywordEntry | null = null;
            let bestScore = 0;

            for (const entry of activityKeywords) {
                for (const term of entry.terms) {
                    if (query.includes(term) || term.includes(query)) {
                        if (term.length > bestScore) {
                            bestScore = term.length;
                            best = entry;
                        }
                    }
                }
            }

            return { ok: true, data: best ? toDetection(best) : null };
        },

        // Suggestions whose term contains the query (deduped, capped at six),
        // matching the legacy activitySearch.
        async search(query: string): Promise<Result<ActivitySuggestion[]>> {
            const q = query.trim().toLowerCase();
            if (q.length < 2) {
                return { ok: true, data: [] };
            }

            const seen = new Set<string>();
            const results: ActivitySuggestion[] = [];

            for (const entry of activityKeywords) {
                for (const term of entry.terms) {
                    if (term.includes(q) && !seen.has(term)) {
                        seen.add(term);
                        results.push({ term, detection: toDetection(entry) });
                    }
                }
            }

            return { ok: true, data: results.slice(0, 6) };
        },
    };
}


export { createLocalActivityDetectionEngine };