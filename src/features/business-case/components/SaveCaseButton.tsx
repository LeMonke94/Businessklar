'use client';

/**
 * SaveCaseButton — the report's "save this case" control.
 *
 * Auth-aware: signed-out users get a "sign in to save" link that returns them
 * to the report (their answers persist in sessionStorage, so the report
 * rebuilds and they can save). Signed-in users get a save button that becomes
 * a "Saved ✓ / View dashboard" state, which also guards against double-saves
 * within the session. (Re-saving across sessions creates a new case — updating
 * an existing case on re-open is a separate, not-yet-built concern.)
 */

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSaveCase } from '@/features/business-case/hooks/useSaveCase';
import type { NewCaseInput } from '@/features/business-case/types';
import styles from './SaveCaseButton.module.css';

function SaveCaseButton({ locale, input }: { locale: string; input: NewCaseInput }) {
    const t = useTranslations('saveCase');
    const { isAuthenticated, isLoading } = useAuth();
    const { saveCase, isSaving } = useSaveCase();
    const [saved, setSaved] = useState(false);
    const [failed, setFailed] = useState(false);

    // Avoid flashing the wrong state before the session is known.
    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.bar}>
                <Link
                    className={styles.primary}
                    href={`/${locale}/sign-in?redirect=/${locale}/report`}
                >
                    {t('signInToSave')}
                </Link>
            </div>
        );
    }

    if (saved) {
        return (
            <div className={styles.bar}>
                <span className={styles.savedMsg}>{t('saved')}</span>
                <Link className={styles.secondary} href={`/${locale}/dashboard`}>
                    {t('viewDashboard')}
                </Link>
            </div>
        );
    }

    const handleSave = async () => {
        setFailed(false);
        const result = await saveCase(input);
        if (result.ok) {
            setSaved(true);
        } else {
            setFailed(true);
        }
    };

    return (
        <div className={styles.bar}>
            <button type="button" className={styles.primary} onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('saving') : t('action')}
            </button>
            {failed && <span className={styles.error}>{t('error')}</span>}
        </div>
    );
}

export { SaveCaseButton };
