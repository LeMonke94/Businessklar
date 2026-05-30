/**
 * ComplianceEngine — port (contract) for the regulatory requirements that
 * apply to a given activity: licenses, chamber membership, recognition of
 * foreign qualifications, Meisterbrief, and so on.
 *
 * Local adapter (Etappe 9.3): keyword matching from the legacy compliance
 * rules. This is the most likely future Supabase-backed engine (these rules
 * change often), so the contract stays async + Result-wrapped and Bundesland
 * is already part of the input for future state-specific rules.
 *
 * Pure contract: no React, no DOM, no Supabase.
 */

import type {
    ActivityCategory,
    BundeslandCode,
    ExtraOption,
} from '@/features/questionnaire/types';
import type { Result } from './types';


type ComplianceSeverity = 'high' | 'medium' | 'info';

/**
 * A single matched compliance requirement. The field set is taken verbatim
 * from the legacy compliance rule objects. Human-readable text is NOT stored
 * here — it is resolved per locale from the message catalogue, keyed by `key`.
 */
type ComplianceRule = {
    key: string;
    severity: ComplianceSeverity;
    requiresLicense: boolean;
    requiresRegistration: boolean;
    requiresDegree: boolean;
    requiresRecognition: boolean;
    requiresMeisterbrief: boolean;
    // e.g. 'STB_Kammer', 'WPK', 'RAK', 'GESUNDHEIT' — verbatim from legacy.
    authorityType: string;
    // Legacy link_override: an official-source key (into OFFICIAL_FALLBACKS)
    // that wins over authorityType when resolving the authority link. Not
    // human-readable text — a structural pointer, resolved to a URL by the
    // authority resolver (Phase 9.5). null when there is no override.
    linkOverride: string | null;
};

type ComplianceInput = {
    activity: ActivityCategory;
    // Raw activity text too: legacy matches keywords against text + category.
    activityText: string;
    // Optional for now (local impl ignores it); reserved for state-specific rules.
    bundesland?: BundeslandCode;
    extras: ExtraOption[];
};

type ComplianceResult = {
    // Matched rules, sorted by severity (high first), as in legacy.
    rules: ComplianceRule[];
    // Legacy `detectFallbackWarning`: a generic "verify requirements" signal
    // when the activity looks regulated but no specific rule matched.
    fallbackWarning: boolean;
};

type ComplianceEngine = {
    evaluate: (input: ComplianceInput) => Promise<Result<ComplianceResult>>;
};


export type {
    ComplianceSeverity,
    ComplianceRule,
    ComplianceInput,
    ComplianceResult,
    ComplianceEngine,
};