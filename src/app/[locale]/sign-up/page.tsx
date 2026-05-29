import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isLocale } from '@/config/i18n';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SignUpForm } from '@/features/auth/components/SignUpForm';
import styles from './page.module.css';

async function SignUpPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    setRequestLocale(locale);

    const t = await getTranslations('auth.signUp');

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{t('title')}</h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>

                <Suspense fallback={null}>
                    <SignUpForm locale={locale} />
                </Suspense>

                <p className={styles.altLink}>
                    {t('hasAccount')}{' '}
                    <Link href={`/${locale}/sign-in`} className={styles.link}>
                        {t('signInLink')}
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignUpPage;