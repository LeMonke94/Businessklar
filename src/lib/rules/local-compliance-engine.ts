import type {
    ComplianceEngine,
    ComplianceInput,
    ComplianceResult,
    ComplianceRule,
} from './compliance-engine';
import type { Result } from './types';
import {
    complianceRules,
    fallbackSignals,
    severityOrder,
    type ComplianceRuleData,
} from './data/compliance-rules';


/**
 * Local ComplianceEngine — keyword matching from the legacy compliance rules.
 * Pure: no React, no DOM, no Supabase. Async + Result-wrapped so a future
 * Supabase-backed engine (these rules change often) can replace it behind the
 * same port.
 *
 * Mirrors the legacy detectComplianceRules + detectFallbackWarning. `extras`
 * and `bundesland` are accepted but not used for matching yet (legacy ignored
 * them too); bundesland is reserved for future state-specific rules.
 */

// Lowercase, collapse whitespace, trim — the legacy normalizeActivityText.
function normalizeActivityText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Strip a data rule down to the port's output shape (drops keywords /
// linkOverride, which are matching / link-resolution concerns).
function toRule(data: ComplianceRuleData): ComplianceRule {
    return {
        key: data.key,
        severity: data.severity,
        requiresLicense: data.requiresLicense,
        requiresRegistration: data.requiresRegistration,
        requiresDegree: data.requiresDegree,
        requiresRecognition: data.requiresRecognition,
        requiresMeisterbrief: data.requiresMeisterbrief,
        authorityType: data.authorityType,
    };
}

function createLocalComplianceEngine(): ComplianceEngine {
    return {
        async evaluate(input: ComplianceInput): Promise<Result<ComplianceResult>> {
            // Legacy matches keywords against the activity text plus the
            // category key.
            const text = normalizeActivityText(`${input.activityText} ${input.activity}`);

            const matched = complianceRules
                .filter((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
                .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
                .map(toRule);

            // Generic "looks regulated, verify" signal — only meaningful when no
            // specific rule matched (the report shows it in that case).
            const fallbackWarning =
                matched.length === 0
                && fallbackSignals.some((signal) => signal.keywords.some((keyword) => text.includes(keyword)));

            return { ok: true, data: { rules: matched, fallbackWarning } };
        },
    };
}


export { createLocalComplianceEngine };