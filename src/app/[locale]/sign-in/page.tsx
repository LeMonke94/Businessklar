import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isLocale } from '@/config/i18n';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SignInForm } from '@/features/auth/components/SignInForm';
import styles from './page.module.css';

async function SignInPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    setRequestLocale(locale);

    const t = await getTranslations('auth.signIn');

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{t('title')}</h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>

                <SignInForm locale={locale} />

                <p className={styles.altLink}>
                    {t('noAccount')}{' '}
                    <Link href={`/${locale}/sign-up`} className={styles.link}>
                        {t('signUpLink')}
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignInPage;