'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { parseNumericInput, toInputValue } from '@/features/questionnaire/numeric';
import type { NumberStep } from '@/features/questionnaire/types';


type StepNumberProps = {
    step: NumberStep;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    error?: string;
};

/**
 * Single number input. Reuses the shared ui/Input for styling and error
 * display; the page renders the step title and hint around it.
 */
function StepNumber({ step, value, onChange, error }: StepNumberProps) {
    const t = useTranslations();

    return (
        <Input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={step.placeholderKey ? t(step.placeholderKey) : undefined}
            value={toInputValue(value)}
            onChange={(event) => onChange(parseNumericInput(event.target.value))}
            error={error}
        />
    );
}


export { StepNumber };
export type { StepNumberProps };