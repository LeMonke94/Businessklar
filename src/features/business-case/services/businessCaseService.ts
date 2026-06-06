/**
 * business-case service — the API the Dashboard uses to read and mutate a
 * user's saved cases.
 *
 * Runs client-side via the browser Supabase client (the same pattern the auth
 * feature uses for its mutations). Row-level security scopes every query to the
 * signed-in owner, so callers never pass a user id; the cookie does that.
 *
 * Supabase types stop here: every method returns our own Result<T> / BusinessCase,
 * never a Supabase row or PostgrestError.
 */

import { createClient } from '@/lib/supabase/client';
import { businessCaseRowSchema, CASE_COLUMNS, type BusinessCaseRow } from '@/features/business-case/schemas';
import { toSurveyAnswers } from '@/features/business-case/mappers/toSurveyAnswers';
import type { BusinessCase, CaseStatus, CaseError, Result, NewCaseInput } from '@/features/business-case/types';


function fail(code: CaseError['code'], message: string): { ok: false; error: CaseError } {
    return { ok: false, error: { code, message } };
}

// Collapse the legacy free-form status string to our three-value enum.
function normalizeStatus(status: string | null | undefined): CaseStatus {
    const s = (status ?? '').toLowerCase();
    if (s === 'completed' || s === 'done') {
        return 'completed';
    }
    if (s === 'draft') {
        return 'draft';
    }
    return 'saved';
}

// Best human title from the saved data, or null for a localized fallback.
function readTitle(row: BusinessCaseRow): string | null {
    const result = row.result_data;
    if (result && typeof result === 'object' && 'report_title' in result) {
        const title = (result as { report_title?: unknown }).report_title;
        if (typeof title === 'string' && title.length > 0) {
            return title;
        }
    }
    return row.activity_text ?? row.legal_form ?? null;
}

function mapRow(row: BusinessCaseRow): BusinessCase {
    return {
        id: row.id,
        title: readTitle(row),
        status: normalizeStatus(row.status),
        createdAt: row.created_at,
        updatedAt: row.updated_at ?? null,
        isShared: row.is_shared ?? false,
        shareToken: row.share_token ?? null,
        answers: toSurveyAnswers(row.raw_data),
    };
}

// Newest first, by updated_at falling back to created_at (mirrors legacy sort).
function sortByRecency(a: BusinessCase, b: BusinessCase): number {
    const ta = Date.parse(a.updatedAt ?? a.createdAt);
    const tb = Date.parse(b.updatedAt ?? b.createdAt);
    if (Number.isNaN(ta) || Number.isNaN(tb) || ta === tb) {
        return b.id.localeCompare(a.id);
    }
    return tb - ta;
}

// Build the business_cases row for a new save, mirroring the legacy payload:
// denormalized columns straight from the answers, plus raw_data (so "Open" can
// rehydrate) and result_data (so the dashboard/share have a title + summary).
function buildRow(input: NewCaseInput, profileId: string) {
    const a = input.answers;
    return {
        profile_id: profileId,
        business_name: null,
        legal_form: input.legalFormLabel,
        recommended_legal_form_key: input.legalFormKey,
        recommended_legal_form_label: input.legalFormLabel,
        activity_key: a.activity ?? null,
        activity_text: a.activity_text ?? null,
        activity_bg: a.activity_bg ?? null,
        city_name: a.city_name ?? null,
        city_hb: a.city_hb ?? null,
        revenue_y1: a.revenue_y1 ?? null,
        expenses_monthly: a.expenses_monthly ?? null,
        staff_fulltime: a.staff_fulltime ?? 0,
        staff_minijob: a.staff_minijob ?? 0,
        extras: a.extras ?? [],
        raw_data: a,
        result_data: {
            report_title: a.activity_text ?? null,
            recommended_legal_form: input.legalFormLabel,
            recommended_legal_form_key: input.legalFormKey,
            recommended_legal_form_label: input.legalFormLabel,
            source_lang: input.sourceLang,
        },
        status: 'completed',
    };
}


const businessCaseService = {
    /** List the signed-in user's saved cases, newest first. */
    async listCases(): Promise<Result<BusinessCase[]>> {
        const supabase = createClient();

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            return fail('not_authenticated', 'You must be signed in to view your cases.');
        }

        const { data, error } = await supabase
            .from('business_cases')
            .select(CASE_COLUMNS)
            .eq('profile_id', userData.user.id);

        if (error) {
            return fail('load_failed', error.message);
        }

        // Parse each row defensively; drop any that do not match the schema
        // rather than failing the whole list on a single dirty legacy row.
        const cases = (data ?? [])
            .map((row) => businessCaseRowSchema.safeParse(row))
            .filter((parsed) => parsed.success)
            .map((parsed) => mapRow(parsed.data))
            .sort(sortByRecency);

        return { ok: true, data: cases };
    },

    /** Permanently delete one case. RLS restricts this to the owner's own rows. */
    async deleteCase(id: string): Promise<Result<void>> {
        const supabase = createClient();

        const { error } = await supabase.from('business_cases').delete().eq('id', id);
        if (error) {
            return fail('delete_failed', error.message);
        }

        return { ok: true, data: undefined };
    },

    /**
     * Return the case's share token, minting one (and flagging the case shared)
     * if it has none yet. Idempotent: calling twice returns the same token.
     */
    async ensureShareToken(id: string): Promise<Result<string>> {
        const supabase = createClient();

        const { data: existing, error: readError } = await supabase
            .from('business_cases')
            .select('share_token')
            .eq('id', id)
            .maybeSingle();

        if (readError) {
            return fail('share_failed', readError.message);
        }
        if (existing?.share_token) {
            return { ok: true, data: existing.share_token };
        }

        const token = crypto.randomUUID().replace(/-/g, '');
        const { error: updateError } = await supabase
            .from('business_cases')
            .update({ share_token: token, is_shared: true })
            .eq('id', id);

        if (updateError) {
            return fail('share_failed', updateError.message);
        }

        return { ok: true, data: token };
    },

    /**
     * Save a freshly completed report as a NEW case (always an insert). The
     * "update an existing case on re-open" path is a separate concern and not
     * handled here. Returns the new case id.
     */
    async saveCase(input: NewCaseInput): Promise<Result<{ id: string }>> {
        const supabase = createClient();

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            return fail('not_authenticated', 'You must be signed in to save a case.');
        }

        const { data, error } = await supabase
            .from('business_cases')
            .insert(buildRow(input, userData.user.id))
            .select('id')
            .single();

        if (error) {
            return fail('save_failed', error.message);
        }

        return { ok: true, data: { id: (data as { id: string }).id } };
    },
};


export { businessCaseService };
