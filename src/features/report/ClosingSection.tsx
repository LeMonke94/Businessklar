'use client';

import { useTranslations } from 'next-intl';
import styles from './ClosingSection.module.css';


/**
 * Closing of the report: the motivational quote and the legal disclaimer, both
 * localized. Ports the legacy renderClosing block (BK_REPORT_I18N closing text).
 */
function ClosingSection() {
    const t = useTranslations('report');

    return (
        <section className={styles.wrap}>
            <blockquote className={styles.quote}>{t('closing.quote')}</blockquote>
            <p className={styles.disclaimer}>{t('closing.disclaimer')}</p>
        </section>
    );
}


export { ClosingSection };
