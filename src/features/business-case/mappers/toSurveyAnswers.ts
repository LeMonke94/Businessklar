/**
 * Normalizes a legacy `raw_data` blob into the questionnaire's SurveyAnswers.
 *
 * The legacy app stored survey answers as raw input strings (revenue as
 * '60000', founders as '3', staff counts as '2', …). The rebuilt questionnaire
 * models the *domain* shape instead — numbers as `number`, founders as the
 * union 1 | 2 | 3 — because the report's rule engines do arithmetic and strict
 * comparisons on these. Writing raw strings straight into `bk_survey_sess`
 * would make the report miscompute, so we coerce here.
 *
 * The field *names* already match between legacy and the new SurveyAnswers; only
 * the value representation differs. Anything unparseable is dropped rather than
 * guessed, matching the questionnaire's fail-soft hydration.
 */

import type {
    SurveyAnswers,
    FoundersCount,
    ExtraOption,
} from '@/features/questionnaire/types';


// Coerce to a finite number, or undefined when absent / unparseable.
function num(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
}

// Legacy stored founders as '1' | '2' | '3' ('3' meaning "3 or more").
function foundersCount(value: unknown): FoundersCount | undefined {
    const n = num(value);
    if (n === undefined) {
        return undefined;
    }
    if (n >= 3) {
        return 3;
    }
    return n === 2 ? 2 : 1;
}

function bool(value: unknown): boolean | undefined {
    if (value === true || value === 'true') {
        return true;
    }
    if (value === false || value === 'false') {
        return false;
    }
    return undefined;
}

function extras(value: unknown): ExtraOption[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    return value.filter((v): v is ExtraOption => typeof v === 'string');
}

// Pass a string through unchanged, or undefined when not a non-empty string.
// The string-union fields (activity, bg, liability, city metadata) are stored
// verbatim by the legacy app, so we trust them like the questionnaire's own
// fail-soft hydration does, rather than re-listing every allowed literal.
function str(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// Drop keys whose value resolved to undefined so the result stays a clean
// partial — the report checks fields with `=== undefined`.
function defined<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined),
    ) as Partial<T>;
}


function toSurveyAnswers(raw: unknown): SurveyAnswers {
    if (typeof raw !== 'object' || raw === null) {
        return {};
    }
    const r = raw as Record<string, unknown>;

    return defined<SurveyAnswers>({
        activity_text: str(r.activity_text),
        activity: str(r.activity) as SurveyAnswers['activity'],
        activity_bg: str(r.activity_bg) as SurveyAnswers['activity_bg'],
        activity_fb: bool(r.activity_fb),

        founders_count: foundersCount(r.founders_count),
        liability_preference: str(r.liability_preference) as SurveyAnswers['liability_preference'],

        city_name: str(r.city_name),
        city_hb: num(r.city_hb),
        city_bundesland: str(r.city_bundesland) as SurveyAnswers['city_bundesland'],
        city_match_source: str(r.city_match_source) as SurveyAnswers['city_match_source'],

        revenue_y1: num(r.revenue_y1),
        expenses_monthly: num(r.expenses_monthly),

        staff_fulltime: num(r.staff_fulltime),
        staff_minijob: num(r.staff_minijob),
        staff_salary_ft: num(r.staff_salary_ft),

        extras: extras(r.extras),
    });
}


export { toSurveyAnswers };
