'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { buildReport, type ReportData } from '@/features/questionnaire/service';
import { computeTax } from '@/lib/finance/tax';
import type { SurveyAnswers } from '@/features/questionnaire/types';
import type { LegalForm } from '@/lib/rules/legal-form-engine';
import { FinanceSection } from './FinanceSection';
import { Button } from '@/components/ui/Button';
import styles from './Report.module.css';


// Legacy survey draft key — the same one the questionnaire writes.
const STORAGE_KEY = 'bk_survey_sess';
// TODO(9.5 part 1): replace with the per-city Hebesatz once the CITIES data is
// added; until then every city uses the nationwide average.
const HEBESATZ_FALLBACK = 400;

// German display labels for the legal forms (legacy used these across locales).
const LEGAL_FORM_LABELS: Record<LegalForm, string> = {
    einzelunternehmen: 'Einzelunternehmen',
    ug: 'UG (haftungsbeschränkt)',
    gmbh: 'GmbH',
    gbr: 'GbR',
    partg: 'PartG',
};

type ReportState =
    | { status: 'loading' }
    | { status: 'empty' }
    | { status: 'error' }
    | { status: 'ready'; data: ReportData };

function readAnswers(): SurveyAnswers | null {
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as SurveyAnswers;
        return Object.keys(parsed).length > 0 ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Report container. Reads the saved answers on the client, orchestrates them
 * via buildReport, holds the active legal form (the switcher in a later step
 * changes it) and computes the tax for that form. Renders the legal-form header
 * and the finance section; the legal-form switcher and compliance section are
 * added in later steps.
 */
function Report() {
    const t = useTranslations('report');
    const locale = useLocale();
    const [state, setState] = useState<ReportState>({ status: 'loading' });
    const [activeForm, setActiveForm] = useState<LegalForm | null>(null);

    useEffect(() => {
        const answers = readAnswers();
        if (!answers) {
            setState({ status: 'empty' });
            return;
        }

        let cancelled = false;
        void buildReport(answers).then((result) => {
            if (cancelled) {
                return;
            }
            if (result.ok) {
                setState({ status: 'ready', data: result.data });
                setActiveForm(result.data.legalForm.recommended);
            } else {
                setState({ status: 'error' });
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (state.status === 'loading') {
        return null;
    }

    if (state.status === 'empty' || state.status === 'error') {
        return (
            <div className={styles.message}>
                <p>{state.status === 'empty' ? t('empty') : t('error')}</p>
                <Button href={`/${locale}/questionnaire`}>{t('backToSurvey')}</Button>
            </div>
        );
    }

    const { data } = state;
    const form = activeForm ?? data.legalForm.recommended;
    const tax = computeTax({
        revenueY1: data.finance.revenueY1,
        expensesMonthly: data.finance.expensesMonthly,
        staffFulltime: data.finance.staffFulltime,
        staffMinijob: data.finance.staffMinijob,
        staffSalaryFt: data.finance.staffSalaryFt,
        hebesatz: HEBESATZ_FALLBACK,
        legalForm: form,
        freiberuflerEligible: data.activity.freiberuflerEligible,
    });

    return (
        <div className={styles.wrap}>
            <header className={styles.header}>
                <div className={styles.legalForm}>
                    <span className={styles.legalFormLabel}>{t('legalFormLabel')}</span>{' '}
                    <strong>{LEGAL_FORM_LABELS[form]}</strong>
                </div>
                <span className={data.legalForm.status === 'freiberuflich' ? styles.badgeFb : styles.badgeGew}>
                    {t(`status.${data.legalForm.status}`)}
                </span>
            </header>

            <FinanceSection report={data} tax={tax} hebesatz={HEBESATZ_FALLBACK} />
        </div>
    );
}


export { Report };