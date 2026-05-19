import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { type Locale } from '@/config/i18n';
import styles from './Footer.module.css';

async function Footer({ locale }: { locale: Locale }) {
    const t = await getTranslations('footer');
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <p className={styles.tagline}>{t('tagline')}</p>

                <nav className={styles.links}>
                    <Link href={`/${locale}/imprint`} className={styles.link}>
                        {t('imprint')}
                    </Link>
                    <Link href={`/${locale}/privacy`} className={styles.link}>
                        {t('privacy')}
                    </Link>
                    <Link href={`/${locale}/terms`} className={styles.link}>
                        {t('terms')}
                    </Link>
                </nav>

                <p className={styles.copyright}>{t('copyright', { year })}</p>
            </div>
        </footer>
    );
}

export { Footer };