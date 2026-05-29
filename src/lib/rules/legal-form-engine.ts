/**
 * LegalFormEngine — port (contract) for recommending a legal form.
 *
 * Local adapter (Etappe 9.3): the legacy rule tree over founders count,
 * liability preference, Freiberufler eligibility and first-year revenue.
 *
 * Pure contract: no React, no DOM, no Supabase.
 */

import type { FoundersCount, LiabilityPreference } from '@/features/questionnaire/types';
import type { Result } from './types';


/**
 * Recommendable legal forms — the only keys the legacy recommendation ever
 * outputs. NOTE: legacy uses the key `eu` for Einzelunternehmen; renamed to
 * `einzelunternehmen` here so it cannot be confused with the `eu_clients`
 * extra option. The adapter maps between the two.
 */
type LegalForm =
    | 'einzelunternehmen'
    | 'gbr'
    | 'partg'
    | 'ug'
    | 'gmbh';

/** Tax status shown alongside the recommendation (the badge in legacy). */
type BusinessStatus = 'freiberuflich' | 'gewerblich';

type LegalFormInput = {
    foundersCount: FoundersCount;
    liabilityPreference: LiabilityPreference;
    // Authoritative Freiberufler flag, carried over from activity detection.
    freiberuflerEligible: boolean;
    revenueY1: number;
};

type LegalFormRecommendation = {
    recommended: LegalForm;
    // Every form valid for this constellation, recommended one included — the
    // legacy report renders these as a switcher with the recommendation active.
    eligible: LegalForm[];
    status: BusinessStatus;
};

type LegalFormEngine = {
    recommend: (input: LegalFormInput) => Promise<Result<LegalFormRecommendation>>;
};


export type {
    LegalForm,
    BusinessStatus,
    LegalFormInput,
    LegalFormRecommendation,
    LegalFormEngine,
};