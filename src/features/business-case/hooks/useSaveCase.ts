/**
 * useSaveCase — saves the current report as a new case.
 *
 * A single TanStack mutation that invalidates the dashboard's case list on
 * success, so a newly saved case shows up immediately if the user navigates
 * there. Used by the report's SaveCaseButton.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessCaseService } from '@/features/business-case/services/businessCaseService';
import { CASES_KEY } from '@/features/business-case/hooks/useBusinessCases';
import type { NewCaseInput, Result } from '@/features/business-case/types';


function useSaveCase() {
    const queryClient = useQueryClient();

    const saveMutation = useMutation({
        mutationFn: (input: NewCaseInput) => businessCaseService.saveCase(input),
        onSuccess: (result) => {
            if (result.ok) {
                queryClient.invalidateQueries({ queryKey: CASES_KEY });
            }
        },
    });

    return {
        saveCase: (input: NewCaseInput): Promise<Result<{ id: string }>> =>
            saveMutation.mutateAsync(input),
        isSaving: saveMutation.isPending,
    };
}


export { useSaveCase };
