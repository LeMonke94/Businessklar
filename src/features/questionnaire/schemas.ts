import { z } from 'zod';
import type { StepId, SurveyAnswers } from './types';


/**
 * Per-step validation for the questionnaire.
 *
 * Each schema receives the full answers and reports the first problem for the
 * fields that step owns, as an i18n key (resolved by the UI). The rules and
 * messages mirror the legacy validateCurrentStep / validateEntireSurvey.
 *
 * Steps without a schema (staff, extras) never block — same as the legacy.
 */

// Root of the validation message keys in messages/<locale>.json.
const KEY = 'questionnaire.validation';

const stepSchemas: Partial<Record<StepId, z.ZodTypeAny>> = {
    activity: z.custom<SurveyAnswers>().superRefine((answers, ctx) => {
        if (!answers.activity_text || !answers.activity_text.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.activity` });
            return;
        }
        if (!answers.activity) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.activityDetect` });
        }
    }),

    founders_count: z.custom<SurveyAnswers>().superRefine((answers, ctx) => {
        if (!answers.founders_count) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.founders` });
        }
    }),

    liability_preference: z.custom<SurveyAnswers>().superRefine((answers, ctx) => {
        if (!answers.liability_preference) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.liability` });
        }
    }),

    city: z.custom<SurveyAnswers>().superRefine((answers, ctx) => {
        if (!answers.city_name || !answers.city_name.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.city` });
        }
    }),

    revenue: z.custom<SurveyAnswers>().superRefine((answers, ctx) => {
        const value = answers.revenue_y1;
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.revenue` });
        }
    }),

    expenses: z.custom<SurveyAnswers>().superRefine((answers, ctx) => {
        const value = answers.expenses_monthly;
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.expenses` });
        }
    }),

    staff_salary: z.custom<SurveyAnswers>().superRefine((answers, ctx) => {
        // Only required when there is at least one full-time employee.
        if ((answers.staff_fulltime ?? 0) > 0) {
            const salary = answers.staff_salary_ft;
            if (typeof salary !== 'number' || !Number.isFinite(salary) || salary <= 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${KEY}.salary` });
            }
        }
    }),
};


/**
 * Validate a single step. Returns an i18n error key, or null when the step is
 * valid (or has no validation).
 */
function validateStep(stepId: StepId, answers: SurveyAnswers): string | null {
    const schema = stepSchemas[stepId];
    if (!schema) {
        return null;
    }
    const result = schema.safeParse(answers);
    return result.success ? null : (result.error.issues[0]?.message ?? null);
}


export { validateStep };