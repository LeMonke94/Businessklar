'use client';

/**
 * MobileMenu — the hamburger menu shown below the desktop breakpoint.
 *
 * Renders nothing visible on desktop (hidden via CSS in Header.module.css);
 * below 1024px the desktop nav/actions are hidden and this takes over. The
 * hamburger morphs to an ✕ and toggles a full-width dropdown panel holding the
 * same nav links, the language switcher, and the auth control.
 *
 * Nav labels are passed in (already translated) so this stays a thin client
 * island while the server Header owns the translations and link list.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { HeaderAuth } from '@/components/layout/HeaderAuth';
import { type Locale } from '@/config/i18n';
import styles from './MobileMenu.module.css';

type NavItem = { href: string; label: string };

type MobileMenuProps = {
    locale: Locale;
    navItems: NavItem[];
    premiumLabel: string;
    menuLabel: string;
};

function MobileMenu({ locale, navItems, premiumLabel, menuLabel }: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const [lastPathname, setLastPathname] = useState(pathname);

    // Close on navigation (link click, language switch, sign out, browser
    // back/forward). Adjusting state during render when a tracked value changes
    // is React's recommended alternative to a setState-in-effect.
    if (pathname !== lastPathname) {
        setLastPathname(pathname);
        setOpen(false);
    }

    return (
        <div className={styles.mobileMenu}>
            <button
                type="button"
                className={styles.toggle}
                aria-label={menuLabel}
                aria-expanded={open}
                aria-controls="mobile-nav-panel"
                onClick={() => setOpen((value) => !value)}
            >
                <span className={`${styles.bars} ${open ? styles.barsActive : ''}`} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </span>
            </button>

            {open && (
                <>
                    <div
                        className={styles.backdrop}
                        aria-hidden="true"
                        onClick={() => setOpen(false)}
                    />
                    <nav id="mobile-nav-panel" className={styles.panel}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={styles.panelLink}
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href={`/${locale}/premium`}
                            className={styles.panelPremium}
                            onClick={() => setOpen(false)}
                        >
                            {premiumLabel}
                        </Link>

                        <div className={styles.divider} />

                        <div className={styles.panelRow}>
                            <LanguageSwitcher locale={locale} />
                            <HeaderAuth locale={locale} />
                        </div>
                    </nav>
                </>
            )}
        </div>
    );
}

export { MobileMenu };
