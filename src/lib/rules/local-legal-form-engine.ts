import type {
    LegalForm,
    LegalFormEngine,
    LegalFormInput,
    LegalFormRecommendation,
    BusinessStatus,
} from './legal-form-engine';
import type { Result } from './types';


/**
 * Local LegalFormEngine — the legacy rule tree over founders count, liability
 * preference, Freiberufler eligibility and first-year revenue. Pure: no React,
 * no DOM, no Supabase. Async + Result-wrapped so a server implementation can
 * replace it behind the same port.
 *
 * The legacy `eu` key maps to `einzelunternehmen` here (see the port note).
 * The pre-liability legacy fallback path is intentionally dropped: liability
 * preference is now a mandatory answer, so it is always present.
 */

// Above this first-year revenue, a liability-focused founder is pointed at a
// GmbH rather than a UG (legacy threshold).
const REVENUE_GMBH_THRESHOLD = 1_000_000;

// Forms available for a given constellation, in the legacy switcher order
// (recommended one included).
function eligibleForms(foundersCount: number, freiberuflerEligible: boolean): LegalForm[] {
    if (foundersCount === 1) {
        return ['einzelunternehmen', 'ug', 'gmbh'];
    }
    return freiberuflerEligible
        ? ['partg', 'gbr', 'ug', 'gmbh']
        : ['gbr', 'ug', 'gmbh'];
}

// The single recommended form — a direct port of the legacy decision tree.
function recommendForm(input: LegalFormInput): LegalForm {
    const { foundersCount, liabilityPreference, freiberuflerEligible, revenueY1 } = input;

    if (foundersCount === 1) {
        if (liabilityPreference === 'yes') {
            return revenueY1 > REVENUE_GMBH_THRESHOLD ? 'gmbh' : 'ug';
        }
        if (liabilityPreference === 'maybe') {
            return freiberuflerEligible ? 'einzelunternehmen' : 'ug';
        }
        return 'einzelunternehmen'; // 'no'
    }

    // Two or more founders.
    if (liabilityPreference === 'yes') {
        return revenueY1 > REVENUE_GMBH_THRESHOLD ? 'gmbh' : 'ug';
    }
    if (liabilityPreference === 'no') {
        return freiberuflerEligible ? 'partg' : 'gbr';
    }
    return freiberuflerEligible ? 'partg' : 'ug'; // 'maybe'
}

function createLocalLegalFormEngine(): LegalFormEngine {
    return {
        async recommend(input: LegalFormInput): Promise<Result<LegalFormRecommendation>> {
            // Legacy badge logic: status follows the Freiberufler flag alone,
            // independent of the chosen form.
            const status: BusinessStatus = input.freiberuflerEligible ? 'freiberuflich' : 'gewerblich';

            return {
                ok: true,
                data: {
                    recommended: recommendForm(input),
                    eligible: eligibleForms(input.foundersCount, input.freiberuflerEligible),
                    status,
                },
            };
        },
    };
}


export { createLocalLegalFormEngine };