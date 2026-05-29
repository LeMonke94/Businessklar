'use client';

import { useTranslations } from 'next-intl';
import { useQuestionnaire } from '@/features/questionnaire/hooks/useQuestionnaire';
import { steps } from '@/features/questionnaire/steps';
import { QuestionnaireStep } from './QuestionnaireStep';
import { Button } from '@/components/ui/Button';
import styles from './Survey.module.css';


/**
 * The questionnaire shell: progress bar, the active step (its title, hint and
 * control via QuestionnaireStep) and back/next navigation. All survey state
 * lives in useQuestionnaire; this component is only the chrome around it.
 */
function Survey() {
    const t = useTranslations();
    const {
        answers,
        setAnswers,
        currentStep,
        stepNumber,
        totalSteps,
        progress,
        isFirstStep,
        isLastStep,
        goNext,
        goBack,
        isHydrated,
    } = useQuestionnaire({ steps });

    // Hold rendering until the saved draft has been read, so a resumed session
    // does not flash the first step before being restored.
    if (!isHydrated || !currentStep) {
        return null;
    }

    // TODO (Etappe 9.4 / 9.5): on the final step, run the engines and render the
    // report. For now finishing is a no-op — the report does not exist yet.
    const handleFinish = () => {
        // report generation will be wired here
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

                <QuestionnaireStep step={currentStep} answers={answers} setAnswers={setAnswers} />
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