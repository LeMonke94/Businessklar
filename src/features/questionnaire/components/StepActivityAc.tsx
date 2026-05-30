'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { activityDetectionEngine } from '@/lib/rules';
import type { ActivitySuggestion } from '@/lib/rules/activity-detection-engine';
import type { SurveyAnswers } from '@/features/questionnaire/types';
import styles from './StepActivityAc.module.css';


type StepActivityAcProps = {
    answers: SurveyAnswers;
    setAnswers: (patch: Partial<SurveyAnswers>) => void;
    error?: string;
};

/**
 * Free-text activity input with a suggestion dropdown and a detection
 * confirmation. Writes activity_text plus the detected activity / BG /
 * Freiberufler flag into the answers via the ActivityDetectionEngine. The
 * confirmation is derived from the stored answers, so a resumed session shows
 * it immediately.
 */
function StepActivityAc({ answers, setAnswers, error }: StepActivityAcProps) {
    const t = useTranslations();
    const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
    const [open, setOpen] = useState(false);
    // Monotonic id guarding against out-of-order async results from fast typing.
    const requestRef = useRef(0);

    const value = answers.activity_text ?? '';

    const handleInput = async (raw: string) => {
        setAnswers({ activity_text: raw });
        const reqId = (requestRef.current += 1);

        const [detResult, searchResult] = await Promise.all([
            activityDetectionEngine.detect(raw),
            activityDetectionEngine.search(raw),
        ]);

        // A newer keystroke already ran; drop this stale result.
        if (requestRef.current !== reqId) {
            return;
        }

        const detection = detResult.ok ? detResult.data : null;
        setAnswers({
            activity: detection?.category,
            activity_bg: detection?.bgCode,
            activity_fb: detection?.freiberuflerEligible,
        });

        const list = searchResult.ok ? searchResult.data : [];
        setSuggestions(list);
        setOpen(list.length > 0 && raw.trim().length >= 2);
    };

    const handleSelect = (suggestion: ActivitySuggestion) => {
        setAnswers({
            activity_text: suggestion.term,
            activity: suggestion.detection.category,
            activity_bg: suggestion.detection.bgCode,
            activity_fb: suggestion.detection.freiberuflerEligible,
        });
        setSuggestions([]);
        setOpen(false);
    };

    return (
        <div className={styles.wrap}>
            <input
                type="text"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="list"
                placeholder={t('questionnaire.steps.activity.placeholder')}
                value={value}
                onChange={(event) => handleInput(event.target.value)}
                onFocus={() => setOpen(suggestions.length > 0)}
                onBlur={() => setOpen(false)}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        setOpen(false);
                    }
                }}
            />

            {open && (
                <ul className={styles.list} role="listbox">
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.term} role="option" aria-selected={false}>
                            <button
                                type="button"
                                className={styles.item}
                                // mouseDown fires before the input's blur closes the list.
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    handleSelect(suggestion);
                                }}
                            >
                                <span className={styles.term}>{suggestion.term}</span>
                                <span className={styles.badge}>{suggestion.detection.bgCode}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {answers.activity && answers.activity_bg && (
                <p className={styles.detected}>
                    <span className={styles.check}>&#10003;</span>{' '}
                    {t('questionnaire.steps.activity.detected')} BG: <strong>{answers.activity_bg}</strong>
                    {answers.activity_fb ? <> &middot; {t('questionnaire.steps.activity.freiberufler')}</> : null}
                </p>
            )}

            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}


export { StepActivityAc };
export type { StepActivityAcProps };