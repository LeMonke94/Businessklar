'use client';

/**
 * useQuestionnaire — owns the survey's client state: the collected answers,
 * which step is active, navigation between steps, autosave, and (optionally)
 * per-step validation gating.
 *
 * It is deliberately engine-agnostic: detection / recommendation happen in the
 * step components and the report, not here. Step definitions and the validator
 * are passed in (the survey page supplies them), so the hook stays pure and
 * testable with mocks.
 *
 * Conditional steps: `visibleSteps` is recomputed from the current answers via
 * each step's `showWhen`, mirroring the legacy `getSteps()` recompute (e.g.
 * staff_salary only appears when staff_fulltime > 0).
 *
 * Persistence: answers are autosaved to sessionStorage under the legacy key
 * `bk_survey_sess` and rehydrated on mount, so a reload keeps progress.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Step, SurveyAnswers } from '@/features/questionnaire/types';


// Legacy sessionStorage key — kept identical so existing drafts survive.
const STORAGE_KEY = 'bk_survey_sess';
// Obsolete legacy localStorage draft key, removed on load (legacy did the same).
const LEGACY_DRAFT_KEY = 'bk_draft';


type StepValidator = (step: Step, answers: SurveyAnswers) => string | null;

type UseQuestionnaireOptions = {
    steps: Step[];
    // Returns an error (i18n key) for a step, or null when valid. Optional:
    // without it, navigation is never blocked.
    validate?: StepValidator;
};

type UseQuestionnaireResult = {
    answers: SurveyAnswers;
    // Merge a partial patch into the answers. Triggers autosave and clears any
    // shown validation error.
    setAnswers: (patch: Partial<SurveyAnswers>) => void;

    // Steps currently shown, after applying every step's showWhen.
    visibleSteps: Step[];
    currentStep: Step | undefined;
    currentStepIndex: number;
    totalSteps: number;

    // 1-based position and 0..1 progress, for the progress bar.
    stepNumber: number;
    progress: number;

    isFirstStep: boolean;
    isLastStep: boolean;

    // Validation error (i18n key) for the current step, or null.
    currentError: string | null;

    // Advance if the current step validates; otherwise set currentError and stay.
    goNext: () => void;
    goBack: () => void;
    // Validate every visible step. On the first failure, jump to that step, set
    // currentError, and return false. Returns true when the whole survey is valid.
    trySubmit: () => boolean;
    reset: () => void;

    // False until the saved draft has been read on the client.
    isHydrated: boolean;
};


// Reads the saved draft from sessionStorage. Returns {} on the server, when
// nothing is saved, or when the stored value is corrupted (fail soft).
function readSavedAnswers(): SurveyAnswers {
    if (typeof window === 'undefined') {
        return {};
    }
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as SurveyAnswers) : {};
    } catch {
        return {};
    }
}


/**
 * Drives the questionnaire. Pass the step definitions (and optionally a
 * validator); get back the answers, navigation actions, validation error and
 * progress needed to render the survey.
 */
function useQuestionnaire({ steps, validate }: UseQuestionnaireOptions): UseQuestionnaireResult {
    const [answers, setAnswersState] = useState<SurveyAnswers>({});
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentError, setCurrentError] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    // Recompute the visible steps whenever answers change (conditional steps).
    const visibleSteps = useMemo(
        () => steps.filter((step) => (step.showWhen ? step.showWhen(answers) : true)),
        [steps, answers],
    );

    const totalSteps = visibleSteps.length;
    const safeIndex = totalSteps === 0 ? 0 : Math.min(currentStepIndex, totalSteps - 1);
    const currentStep = visibleSteps[safeIndex];

    // Hydrate the saved draft once, on the client. Also clear the obsolete
    // localStorage draft key, exactly as the legacy app did.
    useEffect(() => {
        try {
            window.localStorage.removeItem(LEGACY_DRAFT_KEY);
        } catch {
            // ignore — private mode, storage disabled, etc.
        }
        const saved = readSavedAnswers();
        if (Object.keys(saved).length > 0) {
            setAnswersState(saved);
        }
        setIsHydrated(true);
    }, []);

    // Autosave on every answer change — but never before hydration, otherwise
    // the initial empty state would clobber the saved draft on first render.
    useEffect(() => {
        if (!isHydrated) {
            return;
        }
        try {
            window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        } catch {
            // ignore — storage full / unavailable.
        }
    }, [answers, isHydrated]);

    // Keep the stored index in range if the visible steps shrink (e.g. a
    // conditional step disappears while the user is on or past it).
    useEffect(() => {
        if (totalSteps > 0 && currentStepIndex > totalSteps - 1) {
            setCurrentStepIndex(totalSteps - 1);
        }
    }, [currentStepIndex, totalSteps]);

    const setAnswers = useCallback((patch: Partial<SurveyAnswers>) => {
        setAnswersState((prev) => ({ ...prev, ...patch }));
        // Editing the answer clears any error shown for the current step.
        setCurrentError(null);
    }, []);

    const goNext = useCallback(() => {
        const step = visibleSteps[safeIndex];
        if (step && validate) {
            const error = validate(step, answers);
            if (error) {
                setCurrentError(error);
                return;
            }
        }
        setCurrentError(null);
        setCurrentStepIndex((index) => Math.min(index + 1, Math.max(0, visibleSteps.length - 1)));
    }, [visibleSteps, safeIndex, validate, answers]);

    const goBack = useCallback(() => {
        setCurrentError(null);
        setCurrentStepIndex((index) => Math.max(index - 1, 0));
    }, []);

    const trySubmit = useCallback((): boolean => {
        if (validate) {
            for (let i = 0; i < visibleSteps.length; i += 1) {
                const error = validate(visibleSteps[i], answers);
                if (error) {
                    setCurrentStepIndex(i);
                    setCurrentError(error);
                    return false;
                }
            }
        }
        setCurrentError(null);
        return true;
    }, [visibleSteps, validate, answers]);

    const reset = useCallback(() => {
        setAnswersState({});
        setCurrentStepIndex(0);
        setCurrentError(null);
        try {
            window.sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore.
        }
    }, []);

    return {
        answers,
        setAnswers,
        visibleSteps,
        currentStep,
        currentStepIndex: safeIndex,
        totalSteps,
        stepNumber: totalSteps === 0 ? 0 : safeIndex + 1,
        progress: totalSteps === 0 ? 0 : (safeIndex + 1) / totalSteps,
        isFirstStep: safeIndex === 0,
        isLastStep: totalSteps > 0 && safeIndex === totalSteps - 1,
        currentError,
        goNext,
        goBack,
        trySubmit,
        reset,
        isHydrated,
    };
}


export { useQuestionnaire };
export type { UseQuestionnaireOptions, UseQuestionnaireResult, StepValidator };