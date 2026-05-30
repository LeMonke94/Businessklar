'use client';

import { useTranslations } from 'next-intl';
import type { Insurance } from '@/lib/rules/insurance';
import styles from './InsuranceSection.module.css';


type InsuranceSectionProps = {
    insurances: Insurance[];
};

/**
 * Insurance & social-contribution section: one row per relevant policy with a
 * "mandatory" / "recommended" tag and a price · purpose note. Which policies
 * appear and which are mandatory comes from the insurance rule; the name, price
 * and description are resolved from `insurance.items.<key>.*`.
 */
function InsuranceSection({ insurances }: InsuranceSectionProps) {
    const t = useTranslations('report');

    return (
        <section className={styles.wrap}>
            <h2 className={styles.heading}>{t('insurance.title')}</h2>
            <div className={styles.card}>
                <p className={styles.info}>{t('insurance.info')}</p>
                {insurances.map((insurance) => {
                    const base = `insurance.items.${insurance.key}`;
                    return (
                        <div key={insurance.key} className={styles.item}>
                            <div className={styles.itemHead}>
                                <span className={styles.name}>{t(`${base}.name`)}</span>
                                <span className={insurance.mandatory ? styles.tagMust : styles.tagRec}>
                                    {t(insurance.mandatory ? 'insurance.mandatory' : 'insurance.recommended')}
                                </span>
                            </div>
                            <p className={styles.note}>
                                {t(`${base}.price`)} · {t(`${base}.description`)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}


export { InsuranceSection };
export type { InsuranceSectionProps };
