'use client';

import { useTranslations } from 'next-intl';
import type { Obligation } from '@/lib/rules/obligations-calendar';
import styles from './CalendarSection.module.css';


type CalendarSectionProps = {
    obligations: Obligation[];
};

/**
 * Reporting-calendar section: the recurring tax/reporting duties for the chosen
 * setup, each tagged with its frequency (monthly / quarterly / yearly). Which
 * duties appear comes from the obligations rule; the name and deadline detail
 * are resolved from `calendar.items.<key>.*`.
 */
function CalendarSection({ obligations }: CalendarSectionProps) {
    const t = useTranslations('report');

    return (
        <section className={styles.wrap}>
            <h2 className={styles.heading}>{t('calendar.title')}</h2>
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>{t('calendar.heading')}</h3>
                <p className={styles.subtitle}>{t('calendar.subtitle')}</p>
                {obligations.map((obligation) => (
                    <div key={obligation.key} className={styles.item}>
                        <span className={`${styles.freq} ${styles[obligation.frequency]}`}>
                            {t(`calendar.frequency.${obligation.frequency}`)}
                        </span>
                        <div className={styles.itemText}>
                            <strong className={styles.name}>{t(`calendar.items.${obligation.key}.name`)}</strong>
                            <span className={styles.detail}>{t(`calendar.items.${obligation.key}.detail`)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}


export { CalendarSection };
export type { CalendarSectionProps };
