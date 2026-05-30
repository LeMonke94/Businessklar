'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { buildReport, type ReportData } from '@/features/questionnaire/service';
import { computeTax } from '@/lib/finance/tax';
import { deriveRegistrationSteps } from '@/lib/rules/registration-steps';
import { deriveInsurances } from '@/lib/rules/insurance';
import { deriveObligations } from '@/lib/rules/obligations-calendar';
import type { SurveyAnswers } from '@/features/questionnaire/types';
import type { LegalForm } from '@/lib/rules/legal-form-engine';
import { FinanceSection } from './FinanceSection';
import { LegalFormSection } from './LegalFormSection';
import { ComplianceSection } from './ComplianceSection';
import { RegistrationStepsSection } from './RegistrationStepsSection';
import { InsuranceSection } from './InsuranceSection';
import { CalendarSection } from './CalendarSection';
import { ClosingSection } from './ClosingSection';
import { Button } from '@/components/ui/Button';
import styles from './Report.module.css';


// Legacy survey draft key — the same one the questionnaire writes.
const STORAGE_KEY = 'bk_survey_sess';

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
 * via buildReport, holds the active legal form (the switcher changes it) and
 * computes the tax for that form with the city's Hebesatz. Renders the
 * legal-form section and the finance section; the compliance section is added
 * in a later step.
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
        hebesatz: data.city.hebesatz,
        legalForm: form,
        freiberuflerEligible: data.activity.freiberuflerEligible,
    });

    // Pure derivations for the active form (recomputed when the switcher changes),
    // mirroring computeTax above. The legacy report re-ran all of these per form.
    const registrationSteps = deriveRegistrationSteps({
        legalForm: form,
        freiberuflerEligible: data.activity.freiberuflerEligible,
        bgCode: data.activity.bgCode,
        cityName: data.city.name,
    });
    const insurances = deriveInsurances({
        category: data.activity.category,
        extras: data.extras,
    });
    const obligations = deriveObligations({
        isKleinunternehmer: tax.isKleinunternehmer,
        hasStaff: data.finance.staffFulltime > 0 || data.finance.staffMinijob > 0,
        freiberuflerEligible: data.activity.freiberuflerEligible,
    });

    return (
        <div className={styles.wrap}>
            <h1 className={styles.pageTitle}>{t('pageTitle')}</h1>

            <LegalFormSection
                recommended={data.legalForm.recommended}
                eligible={data.legalForm.eligible}
                activeForm={form}
                status={data.legalForm.status}
                onSelectForm={(selected) => setActiveForm(selected)}
            />

            <RegistrationStepsSection steps={registrationSteps} isKleinunternehmer={tax.isKleinunternehmer} />

            <ComplianceSection
                compliance={data.compliance}
                authorities={data.authorities.organs}
                bundesland={data.city.bundesland}
            />

            <FinanceSection report={data} tax={tax} hebesatz={data.city.hebesatz} />

            <InsuranceSection insurances={insurances} />

            <CalendarSection obligations={obligations} />

            <ClosingSection />
        </div>
    );
}


export { Report };