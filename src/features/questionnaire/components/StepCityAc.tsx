'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { findCity, searchCities, FALLBACK_HEBESATZ, type City } from '@/lib/rules/data/cities';
import type { SurveyAnswers } from '@/features/questionnaire/types';
import styles from './StepCityAc.module.css';


type StepCityAcProps = {
    answers: SurveyAnswers;
    setAnswers: (patch: Partial<SurveyAnswers>) => void;
    error?: string;
};

/**
 * City autocomplete. Suggests cities from the list and records the chosen name,
 * its Gewerbesteuer-Hebesatz, its Bundesland, and how it was matched:
 * - 'list_exact'        — typed text matches a listed city exactly
 * - 'list_pick'         — picked from the suggestion dropdown
 * - 'fallback_bundesavg'— free text not on the list (nationwide average applies)
 *
 * The Hebesatz is shown in the suggestion and the confirmation (legacy behaviour)
 * and stored as `city_hb`; an unlisted city falls back to the nationwide average.
 */
function StepCityAc({ answers, setAnswers, error }: StepCityAcProps) {
    const t = useTranslations();
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [open, setOpen] = useState(false);

    const value = answers.city_name ?? '';

    const handleInput = (raw: string) => {
        const exact = findCity(raw);
        setAnswers({
            city_name: raw,
            city_hb: exact ? exact.hebesatz : (raw.trim() ? FALLBACK_HEBESATZ : undefined),
            city_bundesland: exact?.bundesland,
            city_match_source: exact ? 'list_exact' : (raw.trim() ? 'fallback_bundesavg' : undefined),
        });

        const list = searchCities(raw);
        setSuggestions(list);
        setOpen(list.length > 0 && raw.trim().length >= 2);
    };

    const handleSelect = (city: City) => {
        setAnswers({
            city_name: city.name,
            city_hb: city.hebesatz,
            city_bundesland: city.bundesland,
            city_match_source: 'list_pick',
        });
        setSuggestions([]);
        setOpen(false);
    };

    const isConfirmed =
        answers.city_match_source === 'list_exact' || answers.city_match_source === 'list_pick';
    // Only warn once the input clearly is not a listed city (no suggestions left).
    const showFallback =
        answers.city_match_source === 'fallback_bundesavg' && !open && value.trim().length > 0;

    return (
        <div className={styles.wrap}>
            <input
                type="text"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="list"
                placeholder={t('questionnaire.steps.city.placeholder')}
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
                    {suggestions.map((city) => (
                        <li key={city.name} role="option" aria-selected={false}>
                            <button
                                type="button"
                                className={styles.item}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    handleSelect(city);
                                }}
                            >
                                <span className={styles.term}>{city.name}</span>
                                <span className={styles.badge}>{city.hebesatz}%</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {isConfirmed && value.trim().length > 0 && (
                <p className={styles.detected}>
                    <span className={styles.check}>&#10003;</span> <strong>{value}</strong>
                    {answers.city_hb != null ? (
                        <> &middot; {t('questionnaire.steps.city.hebesatz')} {answers.city_hb}%</>
                    ) : null}
                </p>
            )}

            {showFallback && <p className={styles.fallback}>{t('questionnaire.steps.city.fallback')}</p>}

            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}


export { StepCityAc };
export type { StepCityAcProps };