'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, localeMetadata, type Locale } from '@/config/i18n';
import styles from './LanguageSwitcher.module.css';

function LanguageSwitcher({ locale }: { locale: Locale }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close the menu when clicking outside of it.
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Replace the locale segment in the current path and navigate there.
    function switchTo(targetLocale: Locale) {
        // pathname is like "/de/sign-in" — split and swap the locale segment.
        const segments = pathname.split('/');
        segments[1] = targetLocale; // segments[0] is empty (leading slash)
        const newPath = segments.join('/');

        setIsOpen(false);
        router.push(newPath);
    }

    const current = localeMetadata[locale];

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                type="button"
                className={styles.toggle}
                onClick={() => setIsOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className={styles.flag}>{current.flag}</span>
                <span className={styles.code}>{locale.toUpperCase()}</span>
                <span className={styles.chevron}>▾</span>
            </button>

            {isOpen && (
                <div className={styles.menu}>
                    {locales.map((loc) => {
                        const meta = localeMetadata[loc];
                        const isActive = loc === locale;

                        return (
                            <button
                                key={loc}
                                type="button"
                                className={`${styles.option} ${isActive ? styles.active : ''}`}
                                onClick={() => switchTo(loc)}
                            >
                                <span className={styles.flag}>{meta.flag}</span>
                                <span className={styles.optionName}>
                                    {meta.nativeName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export { LanguageSwitcher };