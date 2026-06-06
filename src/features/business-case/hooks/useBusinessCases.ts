/**
 * useBusinessCases — reads the signed-in user's saved cases and exposes the
 * delete / share mutations the Dashboard needs.
 *
 * Mirrors useAuth: a TanStack Query for the list plus mutations that invalidate
 * it on success. The service returns Result<T> (never throws), so a load error
 * is surfaced as data via `loadError` rather than the query's error channel.
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessCaseService } from '@/features/business-case/services/businessCaseService';
import type { CaseError, Result, BusinessCase } from '@/features/business-case/types';

const CASES_KEY = ['business-cases'] as const;


function useBusinessCases() {
    const queryClient = useQueryClient();

    const casesQuery = useQuery({
        queryKey: CASES_KEY,
        queryFn: () => businessCaseService.listCases(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => businessCaseService.deleteCase(id),
        onSuccess: (result) => {
            if (result.ok) {
                queryClient.invalidateQueries({ queryKey: CASES_KEY });
            }
        },
    });

    const shareMutation = useMutation({
        mutationFn: (id: string) => businessCaseService.ensureShareToken(id),
    });

    const result = casesQuery.data;
    const cases: BusinessCase[] = result?.ok ? result.data : [];
    const loadError: CaseError | null = result && !result.ok ? result.error : null;

    return {
        cases,
        isLoading: casesQuery.isLoading,
        loadError,

        deleteCase: (id: string): Promise<Result<void>> => deleteMutation.mutateAsync(id),
        isDeleting: deleteMutation.isPending,

        shareCase: (id: string): Promise<Result<string>> => shareMutation.mutateAsync(id),
        isSharing: shareMutation.isPending,
    };
}


export { useBusinessCases, CASES_KEY };
