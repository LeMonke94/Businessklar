'use client';

import { useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuestionnaire } from '@/features/questionnaire/hooks/useQuestionnaire';
import { steps } from '@/features/questionnaire/steps';
import { validateStep } from '@/features/questionnaire/schemas';
import { QuestionnaireStep } from './QuestionnaireStep';
import { Button } from '@/components/ui/Button';
import type { Step, SurveyAnswers } from '@/features/questionnaire/types';
import styles from './Survey.module.css';


/**
 * The questionnaire shell: progress bar, the active step (its title, hint and
 * control via QuestionnaireStep) and back/next navigation. All survey state
 * lives in useQuestionnaire; this component is the chrome around it.
 */
function Survey() {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();

    // Per-step validation backed by the Zod schemas.
    const validate = useCallback(
        (step: Step, answers: SurveyAnswers) => validateStep(step.id, answers),
        [],
    );

    const {
        answers,
        setAnswers,
        currentStep,
        stepNumber,
        totalSteps,
        progress,
        isFirstStep,
        isLastStep,
        currentError,
        goNext,
        goBack,
        trySubmit,
        isHydrated,
    } = useQuestionnaire({ steps, validate });

    // Hold rendering until the saved draft has been read, so a resumed session
    // does not flash the first step before being restored.
    if (!isHydrated || !currentStep) {
        return null;
    }

    const handleFinish = () => {
        if (!trySubmit()) {
            return;
        }
        // All visible steps valid — answers are already saved in sessionStorage,
        // the report reads them there.
        router.push(`/${locale}/report`);
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.progressInfo}>
                <span>{t('questionnaire.progress', { current: stepNumber, total: totalSteps })}</span>
            </div>
            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
            </div>

            <div className={styles.card}>
                <div className={styles.qNum}>{`Q${stepNumber}`}</div>
                <h2 className={styles.title}>{t(currentStep.titleKey)}</h2>
                <p className={styles.hint}>{t(currentStep.hintKey)}</p>

                <QuestionnaireStep
                    step={currentStep}
                    answers={answers}
                    setAnswers={setAnswers}
                    error={currentError ? t(currentError) : undefined}
                />
            </div>

            <div className={styles.nav}>
                {!isFirstStep && (
                    <Button variant="secondary" onClick={goBack}>
                        {t('questionnaire.nav.back')}
                    </Button>
                )}
                <Button onClick={isLastStep ? handleFinish : goNext}>
                    {isLastStep ? t('questionnaire.nav.finish') : t('questionnaire.nav.next')}
                </Button>
            </div>

            <p className={styles.disclaimer}>{t('questionnaire.disclaimer')}</p>
        </div>
    );
}


export { Survey };