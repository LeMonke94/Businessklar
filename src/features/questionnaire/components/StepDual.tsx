'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { parseNumericInput, toInputValue } from '@/features/questionnaire/numeric';
import type { DualStep, NumberAnswerKey } from '@/features/questionnaire/types';
import styles from './StepDual.module.css';


type StepDualProps = {
    step: DualStep;
    values: Partial<Record<NumberAnswerKey, number | undefined>>;
    onChange: (dataKey: NumberAnswerKey, value: number | undefined) => void;
    error?: string;
};

/**
 * Two number inputs side by side (e.g. full-time + minijob staff). Each field
 * carries its own label and reports under its own dataKey.
 */
function StepDual({ step, values, onChange, error }: StepDualProps) {
    const t = useTranslations();

    return (
        <div>
            <div className={styles.row}>
                {step.fields.map((field) => (
                    <Input
                        key={field.dataKey}
                        label={t(field.labelKey)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                        value={toInputValue(values[field.dataKey])}
                        onChange={(event) => onChange(field.dataKey, parseNumericInput(event.target.value))}
                    />
                ))}
            </div>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}


export { StepDual };
export type { StepDualProps };