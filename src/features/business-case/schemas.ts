/**
 * Zod schema for a `business_cases` row as the Dashboard reads it.
 *
 * Defense in depth: the service parses every row through this before mapping it
 * to a BusinessCase, so a malformed row fails loudly at the boundary instead of
 * rendering a broken card. Columns the Dashboard does not need are not selected.
 *
 * `result_data` and `raw_data` stay `unknown` on purpose — they are legacy
 * free-form JSON. `result_data` is read defensively in the service; `raw_data`
 * is handed to the toSurveyAnswers normalizer.
 */

import { z } from 'zod';


const businessCaseRowSchema = z.object({
    id: z.string(),
    status: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string().nullable().optional(),
    is_shared: z.boolean().nullable().optional(),
    share_token: z.string().nullable().optional(),
    activity_text: z.string().nullable().optional(),
    legal_form: z.string().nullable().optional(),
    result_data: z.unknown().optional(),
    raw_data: z.unknown().optional(),
});

// Columns selected from the table — kept in sync with the schema above.
const CASE_COLUMNS =
    'id, status, created_at, updated_at, is_shared, share_token, activity_text, legal_form, result_data, raw_data';

type BusinessCaseRow = z.infer<typeof businessCaseRowSchema>;


export { businessCaseRowSchema, CASE_COLUMNS };
export type { BusinessCaseRow };
