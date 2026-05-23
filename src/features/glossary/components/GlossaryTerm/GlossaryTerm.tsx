'use client';

import { useState } from 'react';
import styles from './GlossaryTerm.module.css';

function GlossaryTerm({
    nameDe,
    nameLocal,
    body,
}: {
    nameDe: string;
    nameLocal?: string;
    body: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.card} ${isOpen ? styles.open : ''}`}>
            <button
                type="button"
                className={styles.header}
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
            >
                <span className={styles.names}>
                    <span className={styles.nameDe}>{nameDe}</span>
                    {nameLocal && <span className={styles.nameLocal}>{nameLocal}</span>}
                </span>
                <span className={styles.arrow}>▾</span>
            </button>
            {isOpen && <div className={styles.body}>{body}</div>}
        </div>
    );
}

export { GlossaryTerm };