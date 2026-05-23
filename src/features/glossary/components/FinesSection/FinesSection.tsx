import { getTranslations } from 'next-intl/server';
import { finesStructure, vatTrapsStructure } from '@/features/glossary/fines';
import { FineRow } from '@/features/glossary/components/FineRow';
import { GlossaryTerm } from '@/features/glossary/components/GlossaryTerm';
import styles from './FinesSection.module.css';

async function FinesSection() {
    const t = await getTranslations('glossary.fines');

    return (
        <section className={styles.section}>
            <h2 className={styles.heading}>{t('finesHeading')}</h2>
            <div className={styles.fineList}>
                {finesStructure.map((fine, index) => (
                    <FineRow
                        key={fine.key}
                        index={index + 1}
                        title={t(`items.${fine.key}.title`)}
                        law={fine.law}
                        description={t(`items.${fine.key}.description`)}
                        amount={t(`items.${fine.key}.amount`)}
                    />
                ))}
            </div>

            <h2 className={styles.heading}>{t('vatHeading')}</h2>
            <div className={styles.vatList}>
                {vatTrapsStructure.map((trap, index) => (
                    <GlossaryTerm
                        key={trap.key}
                        nameDe={`${index + 1}. ${t(`vatTraps.${trap.key}.title`)}`}
                        body={t(`vatTraps.${trap.key}.body`)}
                    />
                ))}
            </div>

            <p className={styles.disclaimer}>{t('disclaimer')}</p>
        </section>
    );
}

export { FinesSection };