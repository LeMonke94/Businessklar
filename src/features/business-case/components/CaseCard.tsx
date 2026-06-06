'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { BusinessCase } from '@/features/business-case/types';
import styles from './CaseCard.module.css';

// Map our locale codes to BCP-47 tags for date formatting (legacy localeFmt).
const DATE_LOCALE: Record<string, string> = {
    de: 'de-DE',
    en: 'en-GB',
    ru: 'ru-RU',
};

function formatDate(iso: string, locale: string): string {
    try {
        return new Intl.DateTimeFormat(DATE_LOCALE[locale] ?? 'en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

type CaseCardProps = {
    businessCase: BusinessCase;
    onOpen: () => void;
    onPdf: () => void;
    onShare: () => void;
    onDelete: () => void;
    isSharing: boolean;
};

function CaseCard({ businessCase, onOpen, onPdf, onShare, onDelete, isSharing }: CaseCardProps) {
    const t = useTranslations('dashboard');
    const locale = useLocale();
    const c = businessCase;

    // Show "Updated …" when the case was edited after creation, else "Created …".
    const showUpdated = c.updatedAt !== null && c.updatedAt !== c.createdAt;
    const dateIso = showUpdated ? (c.updatedAt as string) : c.createdAt;
    const dateLabel = showUpdated ? t('meta.updated') : t('meta.created');

    return (
        <article className={styles.card}>
            <h3 className={styles.title}>{c.title ?? t('untitled')}</h3>
            <p className={styles.meta}>{`${dateLabel} ${formatDate(dateIso, locale)}`}</p>
            <span className={styles.status}>{t(`status.${c.status}`)}</span>

            <div className={styles.actions}>
                <button type="button" className={styles.action} onClick={onOpen}>
                    {t('actions.open')}
                </button>
                <button type="button" className={styles.action} onClick={onPdf}>
                    {t('actions.pdf')}
                </button>
                <button
                    type="button"
                    className={styles.action}
                    onClick={onShare}
                    disabled={isSharing}
                >
                    {t('actions.share')}
                </button>
                <button
                    type="button"
                    className={`${styles.action} ${styles.danger}`}
                    onClick={onDelete}
                >
                    {t('actions.delete')}
                </button>
            </div>
        </article>
    );
}

export { CaseCard };
