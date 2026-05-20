'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth/hooks/useAuth';
import styles from './HeaderAuth.module.css';

function HeaderAuth({ locale }: { locale: string }) {
    const t = useTranslations('nav');
    const router = useRouter();
    const { user, isAuthenticated, isLoading, signOut, isSigningOut } = useAuth();

    const handleSignOut = async () => {
        const result = await signOut();
        if (result.ok) {
            router.push(`/${locale}`);
        }
    };

    // While the session query is loading on first render, show nothing.
    // Prevents a flash of "Anmelden" before the actual state is known.
    if (isLoading) {
        return <div className={styles.placeholder} />;
    }

    if (isAuthenticated && user) {
        return (
            <div className={styles.authenticated}>
                <span className={styles.userEmail}>{user.email}</span>
                <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={styles.signOutButton}
                >
                    {isSigningOut ? t('signingOut') : t('signOut')}
                </button>
            </div>
        );
    }

    return (
        <Link href={`/${locale}/sign-in`} className={styles.signInButton}>
            {t('signIn')}
        </Link>
    );
}

export { HeaderAuth };