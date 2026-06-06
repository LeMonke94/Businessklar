import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { type Locale } from '@/config/i18n';
import { HeaderAuth } from '@/components/layout/HeaderAuth';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { MobileMenu } from '@/components/layout/MobileMenu';
import styles from './Header.module.css';

async function Header({ locale }: { locale: Locale }) {
    const t = await getTranslations('nav');

    // Defined once and shared by the desktop nav and the mobile menu, so the
    // two never drift apart.
    const navItems = [
        { href: `/${locale}`, label: t('home') },
        { href: `/${locale}/specialists`, label: t('specialists') },
        { href: `/${locale}/glossary`, label: t('glossary') },
        { href: `/${locale}/dashboard`, label: t('dashboard') },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href={`/${locale}`} className={styles.logo}>
                    Business<span>Klar</span>
                </Link>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={styles.navLink}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <LanguageSwitcher locale={locale} />
                    <Link href={`/${locale}/premium`} className={styles.premiumButton}>
                        {t('premium')}
                    </Link>
                    <HeaderAuth locale={locale} />
                </div>

                <MobileMenu
                    locale={locale}
                    navItems={navItems}
                    premiumLabel={t('premium')}
                    menuLabel={t('menu')}
                />
            </div>
        </header>
    );
}

export { Header };