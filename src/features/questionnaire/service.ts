import { legalFormEngine, complianceEngine } from '@/lib/rules';
import type { Result } from '@/lib/rules/types';
import type { LegalFormRecommendation } from '@/lib/rules/legal-form-engine';
import type { ComplianceResult } from '@/lib/rules/compliance-engine';
import type {
    SurveyAnswers,
    ActivityCategory,
    BgCode,
    BundeslandCode,
    CityMatchSource,
    FoundersCount,
    LiabilityPreference,
    ExtraOption,
} from '@/features/questionnaire/types';


/**
 * ReportData — the assembled, validated projection the report renders from.
 *
 * It holds the orchestrated decisions (legal form + compliance) plus the data
 * the report needs to present and to compute finances. The tax computation
 * itself is NOT here: the report does it in Phase 9.5, where the Hebesatz is
 * added — hence finance carries only the raw inputs.
 */
type ReportData = {
    activity: {
        text: string;
        category: ActivityCategory;
        bgCode: BgCode;
        freiberuflerEligible: boolean;
    };
    legalForm: LegalFormRecommendation;
    compliance: ComplianceResult;
    city: {
        name: string;
        bundesland?: BundeslandCode;
        matchSource?: CityMatchSource;
    };
    // Raw finance inputs; the report computes taxes from these in Phase 9.5.
    finance: {
        revenueY1: number;
        expensesMonthly: number;
        staffFulltime: number;
        staffMinijob: number;
        staffSalaryFt?: number;
    };
    foundersCount: FoundersCount;
    liabilityPreference: LiabilityPreference;
    extras: ExtraOption[];
};


function invalid(message: string): Result<ReportData> {
    return { ok: false, error: { code: 'invalid_input', message } };
}

/**
 * Orchestrates the rule engines over completed survey answers and assembles the
 * report data. Activity detection already happened in the questionnaire (its
 * result lives in the answers); here we run the LegalForm and Compliance
 * engines and project everything into a single ReportData.
 *
 * Assumes the answers passed the questionnaire validation, but still narrows the
 * required fields defensively: a missing field yields an invalid_input error so
 * a bad caller fails loudly instead of rendering a broken report. Engine errors
 * are propagated unchanged.
 */
async function buildReport(answers: SurveyAnswers): Promise<Result<ReportData>> {
    const {
        activity,
        activity_text,
        activity_bg,
        activity_fb,
        founders_count,
        liability_preference,
        revenue_y1,
        expenses_monthly,
        city_name,
    } = answers;

    if (
        activity === undefined
        || activity_text === undefined
        || activity_bg === undefined
        || activity_fb === undefined
        || founders_count === undefined
        || liability_preference === undefined
        || revenue_y1 === undefined
        || expenses_monthly === undefined
        || city_name === undefined
    ) {
        return invalid('Survey answers are incomplete.');
    }

    const legalForm = await legalFormEngine.recommend({
        foundersCount: founders_count,
        liabilityPreference: liability_preference,
        freiberuflerEligible: activity_fb,
        revenueY1: revenue_y1,
    });
    if (!legalForm.ok) {
        return legalForm;
    }

    const compliance = await complianceEngine.evaluate({
        activity,
        activityText: activity_text,
        bundesland: answers.city_bundesland,
        extras: answers.extras ?? [],
    });
    if (!compliance.ok) {
        return compliance;
    }

    return {
        ok: true,
        data: {
            activity: {
                text: activity_text,
                category: activity,
                bgCode: activity_bg,
                freiberuflerEligible: activity_fb,
            },
            legalForm: legalForm.data,
            compliance: compliance.data,
            city: {
                name: city_name,
                bundesland: answers.city_bundesland,
                matchSource: answers.city_match_source,
            },
            finance: {
                revenueY1: revenue_y1,
                expensesMonthly: expenses_monthly,
                staffFulltime: answers.staff_fulltime ?? 0,
                staffMinijob: answers.staff_minijob ?? 0,
                staffSalaryFt: answers.staff_salary_ft,
            },
            foundersCount: founders_count,
            liabilityPreference: liability_preference,
            extras: answers.extras ?? [],
        },
    };
}


export { buildReport };
export type { ReportData };