import type { ActivityCategory, ExtraOption } from '@/features/questionnaire/types';


/**
 * Insurance recommendations — which policies to show for a given activity, and
 * which of them are mandatory vs. recommended. Ports the legacy generateReport
 * insurance block (the `insData` array with its `show` / `must` conditions).
 *
 * Pure + synchronous: a total derivation over the detected activity category and
 * the selected extras. Returns only the policy keys + a mandatory flag; the view
 * resolves the name, price and description to text via next-intl.
 *
 * Pure: no React, no DOM, no Supabase, no i18n.
 */

type InsuranceKey =
    | 'betriebshaftpflicht'
    | 'krankenversicherung'
    | 'berufsgenossenschaft'
    | 'vermoegensschaden'
    | 'cyber'
    | 'rechtsschutz'
    | 'berufsunfaehigkeit';

type Insurance = {
    key: InsuranceKey;
    mandatory: boolean;
};

type InsuranceInput = {
    category: ActivityCategory;
    extras: ExtraOption[];
};

// Vermögensschadenhaftpflicht: mandatory for these categories, shown for these
// (legacy: must vs. show differ — medical sees it as recommended, not mandatory).
const VS_MANDATORY = new Set<ActivityCategory>(['it_digital', 'consulting', 'creative']);
const VS_SHOWN = new Set<ActivityCategory>(['it_digital', 'consulting', 'creative', 'medical']);


/**
 * Build the list of relevant insurances for an activity, in the legacy display
 * order. Conditional policies (Vermögensschaden, Cyber) are inserted only when
 * they apply.
 */
function deriveInsurances(input: InsuranceInput): Insurance[] {
    const { category, extras } = input;

    const insurances: Insurance[] = [
        { key: 'betriebshaftpflicht', mandatory: true },
        { key: 'krankenversicherung', mandatory: true },
        { key: 'berufsgenossenschaft', mandatory: true },
    ];

    if (VS_SHOWN.has(category)) {
        insurances.push({ key: 'vermoegensschaden', mandatory: VS_MANDATORY.has(category) });
    }

    if (category === 'it_digital' || extras.includes('personal_data')) {
        insurances.push({ key: 'cyber', mandatory: false });
    }

    insurances.push({ key: 'rechtsschutz', mandatory: false });
    insurances.push({ key: 'berufsunfaehigkeit', mandatory: false });

    return insurances;
}


export { deriveInsurances };
export type { InsuranceKey, Insurance, InsuranceInput };
