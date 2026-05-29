import { getTranslations } from 'next-intl/server';
import styles from './ObligationsSection.module.css';

async function ObligationsSection() {
    const t = await getTranslations('home.obligations');

    const items = [
        { title: t('item1Title'), desc: t('item1Desc') },
        { title: t('item2Title'), desc: t('item2Desc') },
        { title: t('item3Title'), desc: t('item3Desc') },
        { title: t('item4Title'), desc: t('item4Desc') },
        { title: t('item5Title'), desc: t('item5Desc') },
        { title: t('item6Title'), desc: t('item6Desc') },
        { title: t('item7Title'), desc: t('item7Desc') },
        { title: t('item8Title'), desc: t('item8Desc') },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.inner}>
                <span className={styles.kicker}>{t('kicker')}</span>
                <h2 className={styles.heading}>{t('heading')}</h2>
                <p className={styles.subtitle}>{t('subtitle')}</p>

                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.item}>
                            <span className={styles.dot} />
                            <div className={styles.itemText}>
                                <h3 className={styles.itemTitle}>{item.title}</h3>
                                <p className={styles.itemDesc}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className={styles.closer}>{t('closer')}</p>
            </div>
        </section>
    );
}

export { ObligationsSection };