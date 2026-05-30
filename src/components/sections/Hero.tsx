import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/config/i18n';
import { Button } from '@/components/ui/Button';
import styles from './Hero.module.css';

async function Hero({ locale }: { locale: Locale }) {
    const t = await getTranslations('home');

    return (
        <section className={styles.hero}>
            <div className={styles.inner}>
                <span className={styles.kicker}>🇩🇪 {t('kicker')}</span>
                <h1 className={styles.title}>{t('title')}</h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>
                <div className={styles.actions}>
                    <Button variant="primary" href={`/${locale}/questionnaire`}>
                        {t('ctaPrimary')}
                    </Button>
                    <Button variant="secondary" href={`/${locale}/glossary`}>
                        {t('ctaSecondary')}
                    </Button>
                </div>
            </div>
        </section>
    );
}

export { Hero };