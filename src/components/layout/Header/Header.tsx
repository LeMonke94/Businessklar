import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { type Locale } from '@/config/i18n';
import { HeaderAuth } from '@/components/layout/HeaderAuth';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import styles from './Header.module.css';

async function Header({ locale }: { locale: Locale }) {
    const t = await getTranslations('nav');

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href={`/${locale}`} className={styles.logo}>
                    Business<span>Klar</span>
                </Link>
                <nav className={styles.nav}>
                    <Link href={`/${locale}`} className={styles.navLink}>
                        {t('home')}
                    </Link>
                    <Link href={`/${locale}/specialists`} className={styles.navLink}>
                        {t('specialists')}
                    </Link>
                    <Link href={`/${locale}/contact`} className={styles.navLink}>
                        {t('contact')}
                    </Link>
                    <LanguageSwitcher locale={locale} />
                    <HeaderAuth locale={locale} />
                </nav>
            </div>
        </header>
    );
}

export { Header };