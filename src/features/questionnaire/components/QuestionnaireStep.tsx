'use client';

import type {
    Step,
    SurveyAnswers,
    FoundersCount,
    LiabilityPreference,
    ExtraOption,
} from '@/features/questionnaire/types';
import { StepRadio } from './StepRadio';
import { StepCheck } from './StepCheck';
import { StepNumber } from './StepNumber';
import { StepDual } from './StepDual';
import { StepTextarea } from './StepTextarea';
import { StepActivityAc } from './StepActivityAc';
import { StepCityAc } from './StepCityAc';


type QuestionnaireStepProps = {
    step: Step;
    answers: SurveyAnswers;
    setAnswers: (patch: Partial<SurveyAnswers>) => void;
    error?: string;
};

/**
 * Renders the active step by its type and wires it to the answers.
 *
 * This is the one place where the generic, string-based step components meet
 * the typed SurveyAnswers domain — every string -> domain narrowing (founders
 * count, liability, extras) happens here, so the components stay reusable.
 */
function QuestionnaireStep({ step, answers, setAnswers, error }: QuestionnaireStepProps) {
    switch (step.type) {
        case 'radio': {
            if (step.id === 'founders_count') {
                return (
                    <StepRadio
                        step={step}
                        value={answers.founders_count === undefined ? undefined : String(answers.founders_count)}
                        onChange={(value) => setAnswers({ founders_count: Number(value) as FoundersCount })}
                        error={error}
                    />
                );
            }

            return (
                <StepRadio
                    step={step}
                    value={answers.liability_preference}
                    onChange={(value) => setAnswers({ liability_preference: value as LiabilityPreference })}
                    error={error}
                />
            );
        }

        case 'check':
            return (
                <StepCheck
                    step={step}
                    value={answers.extras}
                    onChange={(values) => setAnswers({ extras: values as ExtraOption[] })}
                    error={error}
                />
            );

        case 'number':
            return (
                <StepNumber
                    step={step}
                    value={answers[step.dataKey]}
                    // Computed key on a union of literal keys: cast to the partial.
                    onChange={(value) => setAnswers({ [step.dataKey]: value } as Partial<SurveyAnswers>)}
                    error={error}
                />
            );

        case 'dual':
            return (
                <StepDual
                    step={step}
                    values={answers}
                    onChange={(dataKey, value) => setAnswers({ [dataKey]: value } as Partial<SurveyAnswers>)}
                    error={error}
                />
            );

        case 'textarea':
            return (
                <StepTextarea
                    step={step}
                    value={answers[step.dataKey] as string | undefined}
                    onChange={(value) => setAnswers({ [step.dataKey]: value } as Partial<SurveyAnswers>)}
                    error={error}
                />
            );

        case 'activity_ac':
            return <StepActivityAc answers={answers} setAnswers={setAnswers} error={error} />;

        case 'city_ac':
            return <StepCityAc answers={answers} setAnswers={setAnswers} error={error} />;

        default:
            return null;
    }
}


export { QuestionnaireStep };
export type { QuestionnaireStepProps };