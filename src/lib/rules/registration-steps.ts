import type { BgCode } from '@/features/questionnaire/types';
import type { LegalForm } from './legal-form-engine';
import { findCityAuthority } from './data/city-authorities';
import { berufsgenossenschaftUrls } from './data/berufsgenossenschaften';


/**
 * Registration steps — the ordered "what to do first" checklist for a chosen
 * legal form: Gewerbeanmeldung, notary + Handelsregister, Partnerschaftsregister,
 * Finanzamt (ELSTER), IHK membership, Berufsgenossenschaft and health insurance.
 * Ports the legacy generateReport step list (index.html) verbatim in behaviour.
 *
 * Pure + synchronous, like the authority resolver: a total derivation over data
 * already in memory (the active legal form + the city authority map). It returns
 * only structural data — a step key, its official link and (for the BG step) the
 * detected carrier; the view resolves every label/description to text via
 * next-intl. The chosen legal form drives which steps appear, so the report
 * recomputes this when the user switches form.
 *
 * Pure: no React, no DOM, no Supabase, no i18n.
 */

// Nationwide fallback portals, verbatim from the legacy step list. These differ
// from the compliance resolver's OFFICIAL_FALLBACKS on purpose (the legacy used
// verwaltung.bund.de / ihk.de here, not the Organisationfinder / service-bund).
const PORTALS = {
    gewerbeFallback: 'https://www.verwaltung.bund.de/',
    ihkFallback: 'https://www.ihk.de',
    handelsregister: 'https://www.handelsregister.de',
    elster: 'https://www.elster.de',
} as const;

type RegistrationStepKey =
    | 'gewerbeanmeldung'
    | 'notarHandelsregister'
    | 'partnerschaftsregister'
    | 'finanzamt'
    | 'ihk'
    | 'berufsgenossenschaft'
    | 'krankenversicherung';

/**
 * Text variant a step can take; the view resolves it to a specific label or
 * description. gewerbeanmeldung -> 'perPartner' (GbR registers per partner);
 * notarHandelsregister -> 'gmbh' | 'ug' (different cost note).
 */
type RegistrationStepVariant = 'perPartner' | 'gmbh' | 'ug';

type RegistrationStep = {
    key: RegistrationStepKey;
    // External official link, or null when there is none (health insurance).
    url: string | null;
    variant?: RegistrationStepVariant;
    // Only for 'berufsgenossenschaft': the detected carrier (proper noun, shown
    // verbatim; the view appends it to the step title).
    bgCode?: BgCode;
};

type RegistrationStepsInput = {
    legalForm: LegalForm;
    freiberuflerEligible: boolean;
    bgCode: BgCode;
    cityName: string;
};


/**
 * Build the registration checklist for the active legal form.
 *
 * @param input legal form, Freiberufler flag, detected BG and the user's city
 */
function deriveRegistrationSteps(input: RegistrationStepsInput): RegistrationStep[] {
    const { legalForm, freiberuflerEligible, bgCode, cityName } = input;

    const isCapitalCompany = legalForm === 'ug' || legalForm === 'gmbh';
    const isGbr = legalForm === 'gbr';
    const isPartG = legalForm === 'partg';

    const ca = findCityAuthority(cityName);
    const gewerbeUrl = ca ? ca.gewerbe.url : PORTALS.gewerbeFallback;
    const ihkUrl = ca ? ca.ihk.url : PORTALS.ihkFallback;

    const steps: RegistrationStep[] = [];

    // Gewerbeanmeldung — only for gewerbliche (non-Freiberufler) activities.
    if (!freiberuflerEligible) {
        steps.push({
            key: 'gewerbeanmeldung',
            url: gewerbeUrl,
            ...(isGbr ? { variant: 'perPartner' as const } : {}),
        });
    }

    // Notary + Handelsregister — only for capital companies (UG / GmbH).
    if (isCapitalCompany) {
        steps.push({
            key: 'notarHandelsregister',
            url: PORTALS.handelsregister,
            variant: legalForm === 'gmbh' ? 'gmbh' : 'ug',
        });
    }

    // Partnerschaftsregister — only for PartG.
    if (isPartG) {
        steps.push({ key: 'partnerschaftsregister', url: PORTALS.handelsregister });
    }

    // Finanzamt (ELSTER) — always required.
    steps.push({ key: 'finanzamt', url: PORTALS.elster });

    // IHK membership — only for gewerbliche activities.
    if (!freiberuflerEligible) {
        steps.push({ key: 'ihk', url: ihkUrl });
    }

    // Berufsgenossenschaft — always; the carrier depends on the activity.
    steps.push({ key: 'berufsgenossenschaft', url: berufsgenossenschaftUrls[bgCode], bgCode });

    // Health insurance — always; no single official link.
    steps.push({ key: 'krankenversicherung', url: null });

    return steps;
}


export { deriveRegistrationSteps };
export type {
    RegistrationStepKey,
    RegistrationStepVariant,
    RegistrationStep,
    RegistrationStepsInput,
};
