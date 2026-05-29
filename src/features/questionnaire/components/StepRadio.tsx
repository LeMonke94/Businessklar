'use client';

import { useTranslations } from 'next-intl';
import type { RadioStep } from '@/features/questionnaire/types';
import styles from './StepRadio.module.css';


type StepRadioProps = {
    step: RadioStep;
    value: string | undefined;
    onChange: (value: string) => void;
    error?: string;
};

/**
 * Single-choice step. Renders each option as a selectable row; clicking one
 * reports its value. Option labels are i18n keys, resolved here.
 */
function StepRadio({ step, value, onChange, error }: StepRadioProps) {
    const t = useTranslations();

    return (
        <div className={styles.group} role="radiogroup">
            {step.options.map((option) => {
                const selected = value === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`${styles.option} ${selected ? styles.selected : ''}`}
                        onClick={() => onChange(option.value)}
                    >
                        <span className={styles.indicator}>
                            <span className={styles.dot} />
                        </span>
                        <span className={styles.label}>{t(option.labelKey)}</span>
                    </button>
                );
            })}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}


export { StepRadio };
export type { StepRadioProps };