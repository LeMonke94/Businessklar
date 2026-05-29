/**
 * Core domain types for the questionnaire feature.
 *
 * Describes the data the survey collects (SurveyAnswers) and the machinery
 * that drives it (Step definitions, step types).
 *
 * Layering note: the rule-engine ports in `lib/rules/` import the domain
 * primitives below via `import type`, mirroring how `lib/auth/provider.ts`
 * imports `Session` / `Result` from `features/auth/types`. Type-only imports
 * are erased at runtime, so the lib -> feature direction is fine for types
 * while runtime imports stay forbidden.
 */


// ============================================================================
// Domain primitives
// ============================================================================

/**
 * Activity categories produced by the ActivityDetectionEngine.
 * Mirrors the distinct `k` values in the legacy ACTIVITIES array (12 total).
 * A single category can be matched by several keyword groups with different
 * BG codes / Freiberufler flags, which is why `bgCode` and the Freiberufler
 * flag are stored separately rather than derived from the category.
 */
type ActivityCategory =
    | 'it_digital'
    | 'creative'
    | 'consulting'
    | 'regulated_advice'
    | 'finance_services'
    | 'craft'
    | 'trade'
    | 'gastro'
    | 'personal_care'
    | 'medical'
    | 'services'
    | 'other';

/**
 * Statutory accident-insurance carrier (Berufsgenossenschaft) code attached
 * to a detected activity. Verbatim from the legacy ACTIVITIES / bgMap.
 */
type BgCode =
    | 'VBG'
    | 'BG BAU'
    | 'BGHW'
    | 'BGN'
    | 'BGW'
    | 'BG Verkehr'
    | 'SVLFG'
    | 'BG ETEM'
    | 'BG (DGUV)';

/**
 * The 16 German federal states, resolved from the chosen city.
 * PROVISIONAL: codes follow ISO 3166-2:DE here. Cross-check against the
 * actual values in legacy `city-to-bl.js` / `blLabel` in Phase 9.2 and adjust
 * if the legacy uses different codes.
 */
type BundeslandCode =
    | 'BW' | 'BY' | 'BE' | 'BB' | 'HB' | 'HH' | 'HE' | 'MV'
    | 'NI' | 'NW' | 'RP' | 'SL' | 'SN' | 'ST' | 'SH' | 'TH';

/**
 * Output of activity detection from free text.
 * `freiberuflerEligible` means the activity *can* qualify as Freiberufler
 * (§ 18 EStG) — not a guarantee; final classification depends on the actual
 * work performed.
 */
type ActivityDetection = {
    category: ActivityCategory;
    bgCode: BgCode;
    freiberuflerEligible: boolean;
};

/** How the chosen city was matched. Verbatim from legacy `city_match_source`. */
type CityMatchSource = 'list_exact' | 'list_pick' | 'fallback_bundesavg';

/** Founders question. 3 means "3 or more" (legacy `founders_3plus`). */
type FoundersCount = 1 | 2 | 3;

/** Liability preference. Legacy values, kept verbatim. Always shown. */
type LiabilityPreference = 'yes' | 'maybe' | 'no';

/** Multi-select options in the final "extras" step. Legacy values. */
type ExtraOption =
    | 'ecommerce'
    | 'eu_clients'
    | 'non_eu'
    | 'personal_data'
    | 'financial_risk'
    | 'employees_later'
    | 'none';


// ============================================================================
// Survey answers
// ============================================================================

/**
 * Everything the questionnaire collects. All fields are optional because the
 * survey is filled incrementally and autosaved to sessionStorage (legacy key
 * `bk_survey_sess`) at every step.
 *
 * Representation note: where legacy stored raw input strings (e.g. revenue as
 * '60000'), we model the *domain* shape instead — numbers as `number`, fixed
 * choices as string/number unions. React Hook Form + Zod coerce and validate
 * at the edge, so the stored shape stays clean.
 */
type SurveyAnswers = {
    // Step 1 — activity (free text + auto-detection)
    activity_text?: string;
    activity?: ActivityCategory;
    activity_bg?: BgCode;
    activity_fb?: boolean;

    // Step 2 — founders
    founders_count?: FoundersCount;

    // Step 3 — liability (always shown, per legacy)
    liability_preference?: LiabilityPreference;

    // Step 4 — city
    city_name?: string;
    city_hb?: number; // Gewerbesteuer-Hebesatz, e.g. 400
    city_bundesland?: BundeslandCode;
    city_match_source?: CityMatchSource;

    // Steps 5 / 6 — finances
    revenue_y1?: number;
    expenses_monthly?: number;

    // Step 7 — staff (dual input)
    staff_fulltime?: number;
    staff_minijob?: number;

    // Step 8 — staff salary (only shown when staff_fulltime > 0)
    staff_salary_ft?: number;

    // Step 9 — extras (multi-select)
    extras?: ExtraOption[];
};


// ============================================================================
// Steps
// ============================================================================

/**
 * Stable identifier for each step. Distinct from the SurveyAnswers data keys
 * (e.g. step `revenue` writes the `revenue_y1` field).
 */
type StepId =
    | 'activity'
    | 'founders_count'
    | 'liability_preference'
    | 'city'
    | 'revenue'
    | 'expenses'
    | 'staff'
    | 'staff_salary'
    | 'extras';

/** The seven kinds of step the renderer knows how to draw. */
type StepType =
    | 'radio'
    | 'check'
    | 'number'
    | 'dual'
    | 'textarea'
    | 'activity_ac'
    | 'city_ac';

/**
 * Keys of SurveyAnswers that hold a free `number` value (revenue, expenses,
 * staff counts, salary, Hebesatz). Used to type number/dual step targets so a
 * step can only ever write to a real numeric field — no typos, no wiring a
 * number input to `extras`. The check is `number extends ...` (not the other
 * way round) so literal-number unions like FoundersCount are excluded.
 */
type NumberAnswerKey = {
    [K in keyof SurveyAnswers]-?: number extends NonNullable<SurveyAnswers[K]> ? K : never;
}[keyof SurveyAnswers];

/** One selectable option in a radio/check step. */
type StepOption = {
    value: string;
    labelKey: string;
};

/** Fields shared by every step. `titleKey` / `hintKey` are i18n keys. */
type StepBase = {
    id: StepId;
    titleKey: string;
    hintKey: string;
    // Makes a step conditional, e.g. staff_salary only when staff_fulltime > 0.
    showWhen?: (answers: SurveyAnswers) => boolean;
};

/** Single-choice. Writes the chosen value to the answer field named by `id`. */
type RadioStep = StepBase & {
    type: 'radio';
    options: StepOption[];
};

/** Multi-choice. Writes the selected values to the answer field named by `id`. */
type CheckStep = StepBase & {
    type: 'check';
    options: StepOption[];
};

/** One number input. `dataKey` names the SurveyAnswers field (id != key). */
type NumberStep = StepBase & {
    type: 'number';
    dataKey: NumberAnswerKey;
    placeholderKey?: string;
};

/** One half of a dual step. */
type DualField = {
    dataKey: NumberAnswerKey;
    labelKey: string;
    placeholderKey?: string;
};

/** Two number inputs side by side (e.g. full-time + minijob staff). */
type DualStep = StepBase & {
    type: 'dual';
    fields: [DualField, DualField];
};

/** Free text. `dataKey` names the SurveyAnswers field it writes. */
type TextareaStep = StepBase & {
    type: 'textarea';
    dataKey: keyof SurveyAnswers;
    placeholderKey?: string;
};

/**
 * Activity free-text with autocomplete + auto-detection. No extra config: it
 * writes activity_text / activity / activity_bg / activity_fb itself via the
 * ActivityDetectionEngine.
 */
type ActivityAcStep = StepBase & {
    type: 'activity_ac';
};

/**
 * City autocomplete. No extra config: it writes city_name / city_hb /
 * city_bundesland / city_match_source itself.
 */
type CityAcStep = StepBase & {
    type: 'city_ac';
};

/**
 * A step definition, discriminated on `type`. Narrowing on `step.type` exposes
 * exactly the config that kind carries (`options` for radio, `dataKey` for
 * number, `fields` for dual, …). Option *values* stay `string` here; the Zod
 * schemas in Etappe 1.6 enforce that they match each field's domain type.
 */
type Step =
    | RadioStep
    | CheckStep
    | NumberStep
    | DualStep
    | TextareaStep
    | ActivityAcStep
    | CityAcStep;


export type {
    ActivityCategory,
    BgCode,
    BundeslandCode,
    ActivityDetection,
    CityMatchSource,
    FoundersCount,
    LiabilityPreference,
    ExtraOption,
    SurveyAnswers,
    NumberAnswerKey,
    StepId,
    StepType,
    StepOption,
    Step,
    RadioStep,
    CheckStep,
    NumberStep,
    DualStep,
    DualField,
    TextareaStep,
    ActivityAcStep,
    CityAcStep,
};