'use client';

import { useTranslations } from 'next-intl';
import type { CheckStep } from '@/features/questionnaire/types';
import styles from './StepCheck.module.css';


type StepCheckProps = {
    step: CheckStep;
    value: string[] | undefined;
    onChange: (values: string[]) => void;
    error?: string;
};

/**
 * Multi-choice step. Toggles each option in or out of the selected array.
 * (No special 'none' exclusivity — that matches the legacy toggle behaviour.)
 */
function StepCheck({ step, value, onChange, error }: StepCheckProps) {
    const t = useTranslations();
    const selected = value ?? [];

    const toggle = (optionValue: string) => {
        if (selected.includes(optionValue)) {
            onChange(selected.filter((entry) => entry !== optionValue));
        } else {
            onChange([...selected, optionValue]);
        }
    };

    return (
        <div className={styles.group} role="group">
            {step.options.map((option) => {
                const isSelected = selected.includes(option.value);

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        onClick={() => toggle(option.value)}
                    >
                        <span className={styles.box}>{isSelected ? '\u2713' : ''}</span>
                        <span className={styles.label}>{t(option.labelKey)}</span>
                    </button>
                );
            })}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}


export { StepCheck };
export type { StepCheckProps };