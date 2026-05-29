'use client';

/**
 * useQuestionnaire — owns the survey's client state: the collected answers,
 * which step is active, navigation between steps, and autosave.
 *
 * It is deliberately engine-agnostic: detection / recommendation happen in the
 * step components and the report, not here. Step definitions are passed in (the
 * survey page supplies them from steps.ts), so the hook stays pure and testable
 * with mock steps.
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


type UseQuestionnaireOptions = {
    steps: Step[];
};

type UseQuestionnaireResult = {
    answers: SurveyAnswers;
    // Merge a partial patch into the answers. Triggers autosave.
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

    goNext: () => void;
    goBack: () => void;
    reset: () => void;

    // False until the saved draft has been read on the client. Lets the page
    // hold rendering until answers are hydrated, avoiding a flash of empty state.
    isHydrated: boolean;
};


// Reads the saved draft from sessionStorage. Returns {} on the server, when
// nothing is saved, or when the stored value is corrupted (legacy behaviour:
// fail soft rather than crash).
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
 * Drives the questionnaire. Pass the step definitions; get back the answers,
 * navigation actions, and progress needed to render the survey.
 */
function useQuestionnaire({ steps }: UseQuestionnaireOptions): UseQuestionnaireResult {
    const [answers, setAnswersState] = useState<SurveyAnswers>({});
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
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
    }, []);

    const goNext = useCallback(() => {
        setCurrentStepIndex((index) => Math.min(index + 1, Math.max(0, visibleSteps.length - 1)));
    }, [visibleSteps.length]);

    const goBack = useCallback(() => {
        setCurrentStepIndex((index) => Math.max(index - 1, 0));
    }, []);

    const reset = useCallback(() => {
        setAnswersState({});
        setCurrentStepIndex(0);
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
        goNext,
        goBack,
        reset,
        isHydrated,
    };
}


export { useQuestionnaire };
export type { UseQuestionnaireOptions, UseQuestionnaireResult };