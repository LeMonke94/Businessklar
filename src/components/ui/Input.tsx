import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    hint?: string;
};

/**
 * Form input with optional label, hint, and error message.
 *
 * Uses forwardRef so React Hook Form's register() can attach refs.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, id, ...inputProps }, ref) => {
        const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

        return (
            <div className={styles.field}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    {...inputProps}
                />
                {hint && !error && <p className={styles.hint}>{hint}</p>}
                {error && <p className={styles.error}>{error}</p>}
            </div>
        );
    },
);

Input.displayName = 'Input';

export { Input };