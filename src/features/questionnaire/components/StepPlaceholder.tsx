'use client';

import { Input } from '@/components/ui/Input';
import styles from './StepPlaceholder.module.css';


type StepPlaceholderProps = {
    stepType: 'activity_ac' | 'city_ac';
};

/**
 * TEMPORARY stand-in for the autocomplete steps until Etappe 1.7 builds the
 * real activity / city autocompletes. Renders a disabled input so the survey
 * stays navigable, plus a note that the control is not wired yet. Remove this
 * file once the real components exist.
 */
function StepPlaceholder({ stepType }: StepPlaceholderProps) {
    return (
        <div>
            <Input type="text" value="" disabled placeholder="" />
            <p className={styles.note}>Autocomplete ({stepType}) — added in Etappe 1.7.</p>
        </div>
    );
}


export { StepPlaceholder };
export type { StepPlaceholderProps };