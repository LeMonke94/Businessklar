'use client';

import { useTranslations } from 'next-intl';
import type { TextareaStep } from '@/features/questionnaire/types';
import styles from './StepTextarea.module.css';


type StepTextareaProps = {
    step: TextareaStep;
    value: string | undefined;
    onChange: (value: string) => void;
    error?: string;
};

/**
 * Free-text step. No current step uses it, but it is provided for completeness
 * with the StepType union and the legacy renderer.
 */
function StepTextarea({ step, value, onChange, error }: StepTextareaProps) {
    const t = useTranslations();

    return (
        <div>
            <textarea
                className={styles.textarea}
                rows={4}
                autoComplete="off"
                placeholder={step.placeholderKey ? t(step.placeholderKey) : undefined}
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}


export { StepTextarea };
export type { StepTextareaProps };