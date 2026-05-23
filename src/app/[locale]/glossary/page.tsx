import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isLocale } from '@/config/i18n';
import { notFound } from 'next/navigation';
import { glossaryStructure } from '@/features/glossary/structure';
import { GlossaryCategory } from '@/features/glossary/components/GlossaryCategory';
import styles from './page.module.css';

async function GlossaryPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    setRequestLocale(locale);

    const t = await getTranslations('glossary');

    return (
        <div className={styles.container}>
            <span className={styles.kicker}>{t('pageKicker')}</span>
            <h1 className={styles.title}>{t('pageTitle')}</h1>
            <p className={styles.subtitle}>{t('pageSubtitle')}</p>

            <div className={styles.content}>
                {glossaryStructure.map((category) => (
                    <GlossaryCategory key={category.categoryKey} category={category} />
                ))}
            </div>
        </div>
    );
}

export default GlossaryPage;