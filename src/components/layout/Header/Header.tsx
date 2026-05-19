import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { type Locale } from '@/config/i18n';
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
                    <Link href={`/${locale}/sign-in`} className={styles.navLinkPrimary}>
                        {t('signIn')}
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export { Header };