'use client';

/**
 * Dashboard — the client island for the account page. Lists the user's saved
 * cases and wires the four card actions:
 *
 * - Open: writes the case's (normalized) answers into the questionnaire's
 *   sessionStorage key and routes to /report, which rehydrates from there.
 * - PDF:  same as Open, plus a print flag the report reads to trigger print.
 * - Share: mints/reuses a share token and shows a copyable /share link.
 * - Delete: confirm, then remove from Supabase.
 *
 * The auth gate and the welcome name come from the server page; this island
 * only owns the case list and its mutations.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBusinessCases } from '@/features/business-case/hooks/useBusinessCases';
import { Button } from '@/components/ui/Button';
import { CaseCard } from './CaseCard';
import { ShareDialog } from './ShareDialog';
import { ConfirmDialog } from './ConfirmDialog';
import type { BusinessCase } from '@/features/business-case/types';
import styles from './Dashboard.module.css';

// The questionnaire/report read answers from this sessionStorage key; the
// report reads the print flag once after it renders.
const SURVEY_KEY = 'bk_survey_sess';
const PRINT_KEY = 'bk_print_request';

function Dashboard({ locale, userName }: { locale: string; userName: string }) {
    const t = useTranslations('dashboard');
    const router = useRouter();
    const { cases, isLoading, loadError, deleteCase, isDeleting, shareCase, isSharing } =
        useBusinessCases();

    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const openCase = (businessCase: BusinessCase, print = false) => {
        try {
            window.sessionStorage.setItem(SURVEY_KEY, JSON.stringify(businessCase.answers));
            if (print) {
                window.sessionStorage.setItem(PRINT_KEY, '1');
            }
        } catch {
            // Storage unavailable — navigate anyway; the report shows its empty state.
        }
        router.push(`/${locale}/report`);
    };

    const handleShare = async (businessCase: BusinessCase) => {
        setNotice(null);
        const result = await shareCase(businessCase.id);
        if (result.ok) {
            setShareUrl(`${window.location.origin}/${locale}/share?token=${result.data}`);
        } else {
            setNotice(t('share.failed'));
        }
    };

    const confirmDelete = async () => {
        if (!confirmId) {
            return;
        }
        const result = await deleteCase(confirmId);
        setConfirmId(null);
        if (!result.ok) {
            setNotice(t('deleteFailed'));
        }
    };

    return (
        <div className={styles.wrap}>
            <h1 className={styles.title}>{t('welcome', { name: userName })}</h1>
            <p className={styles.subtitle}>{t('subtitle')}</p>

            {notice && <p className={styles.notice}>{notice}</p>}

            {isLoading ? (
                <p className={styles.state}>{t('loading')}</p>
            ) : loadError ? (
                <p className={styles.state}>{t('loadError')}</p>
            ) : cases.length === 0 ? (
                <div className={styles.empty}>
                    <h2 className={styles.emptyTitle}>{t('empty.title')}</h2>
                    <p className={styles.emptyBody}>{t('empty.body')}</p>
                    <Button href={`/${locale}/questionnaire`}>{t('empty.cta')}</Button>
                </div>
            ) : (
                <div className={styles.list}>
                    {cases.map((businessCase) => (
                        <CaseCard
                            key={businessCase.id}
                            businessCase={businessCase}
                            onOpen={() => openCase(businessCase)}
                            onPdf={() => openCase(businessCase, true)}
                            onShare={() => handleShare(businessCase)}
                            onDelete={() => setConfirmId(businessCase.id)}
                            isSharing={isSharing}
                        />
                    ))}
                </div>
            )}

            {shareUrl && (
                <ShareDialog
                    title={t('share.title')}
                    url={shareUrl}
                    copyLabel={t('share.copy')}
                    copiedLabel={t('share.copied')}
                    closeLabel={t('share.close')}
                    onClose={() => setShareUrl(null)}
                />
            )}

            {confirmId && (
                <ConfirmDialog
                    message={t('confirm.title')}
                    confirmLabel={t('confirm.confirm')}
                    cancelLabel={t('confirm.cancel')}
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmId(null)}
                    isBusy={isDeleting}
                />
            )}
        </div>
    );
}

export { Dashboard };
