import { getTranslations } from 'next-intl/server';
import styles from './TrustSection.module.css';

async function TrustSection() {
    const t = await getTranslations('home.trust');

    const items = [
        {
            title: t('item1Title'),
            description: t('item1Desc'),
        },
        {
            title: t('item2Title'),
            description: t('item2Desc'),
        },
        {
            title: t('item3Title'),
            description: t('item3Desc'),
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.inner}>
                <h2 className={styles.heading}>{t('heading')}</h2>
                <div className={styles.grid}>
                    {items.map((item) => (
                        <div key={item.title} className={styles.item}>
                            <h3 className={styles.itemTitle}>{item.title}</h3>
                            <p className={styles.itemDesc}>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export { TrustSection };