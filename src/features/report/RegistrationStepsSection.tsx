'use client';

import { useTranslations } from 'next-intl';
import type { RegistrationStep } from '@/lib/rules/registration-steps';
import styles from './RegistrationStepsSection.module.css';


type RegistrationStepsSectionProps = {
    steps: RegistrationStep[];
    // Picks which open question to show (legacy: Kleinunternehmer vs. accounting).
    isKleinunternehmer: boolean;
};

/**
 * The "what to do first" area of the report: the ordered registration checklist
 * for the active legal form (each step with its official link), followed by the
 * single open question to clarify with a tax adviser. Step titles/descriptions
 * are resolved from `registrationSteps.items.<key>.*`; variants (GbR per-partner,
 * GmbH vs. UG notary cost) select a specific label, and the BG step appends the
 * detected carrier verbatim.
 */
function RegistrationStepsSection({ steps, isKleinunternehmer }: RegistrationStepsSectionProps) {
    const t = useTranslations('report');

    const stepTitle = (step: RegistrationStep): string => {
        const base = `registrationSteps.items.${step.key}`;
        if (step.key === 'gewerbeanmeldung') {
            return t(step.variant === 'perPartner' ? `${base}.titlePerPartner` : `${base}.title`);
        }
        if (step.key === 'berufsgenossenschaft') {
            return `${t(`${base}.title`)}: ${step.bgCode ?? ''}`;
        }
        return t(`${base}.title`);
    };

    const stepDescription = (step: RegistrationStep): string => {
        const base = `registrationSteps.items.${step.key}`;
        if (step.key === 'notarHandelsregister') {
            return t(step.variant === 'gmbh' ? `${base}.descriptionGmbh` : `${base}.descriptionUg`);
        }
        return t(`${base}.description`);
    };

    return (
        <section className={styles.wrap}>
            <h2 className={styles.heading}>{t('registrationSteps.title')}</h2>

            <div className={styles.card}>
                <p className={styles.subtitle}>{t('registrationSteps.subtitle')}</p>
                <ol className={styles.steps}>
                    {steps.map((step, index) => (
                        <li key={step.key} className={styles.step}>
                            <span className={styles.num} aria-hidden="true">{index + 1}</span>
                            <div className={styles.stepText}>
                                <strong className={styles.stepTitle}>{stepTitle(step)}</strong>
                                <span className={styles.stepDesc}>{stepDescription(step)}</span>
                                {step.url && (
                                    <a
                                        className={styles.stepLink}
                                        href={step.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        → {t('registrationSteps.officialLink')}
                                    </a>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>{t('openQuestions.title')}</h3>
                <p className={styles.subtitle}>{t('openQuestions.subtitle')}</p>
                <p className={styles.question}>
                    {t(isKleinunternehmer ? 'openQuestions.kleinunternehmer' : 'openQuestions.accounting')}
                </p>
            </div>
        </section>
    );
}


export { RegistrationStepsSection };
export type { RegistrationStepsSectionProps };
