import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isLocale } from '@/config/i18n';
import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';


// Shape returned by the get_shared_case_by_token RPC (minimal, by design — it
// deliberately does not expose raw_data or the full row).
type SharedCase = {
    legal_form: string | null;
    activity_text: string | null;
    city_name: string | null;
    revenue_y1: number | null;
    expenses_monthly: number | null;
};

const NUMBER_LOCALE: Record<string, string> = {
    de: 'de-DE',
    en: 'en-GB',
    ru: 'ru-RU',
};

function formatEuro(value: number | null, locale: string): string | null {
    if (value === null || !Number.isFinite(value)) {
        return null;
    }
    return new Intl.NumberFormat(NUMBER_LOCALE[locale] ?? 'en-GB', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(value);
}

type SharePageProps = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ token?: string }>;
};

/**
 * Public read-only view of a shared case. Resolves the token through the
 * SECURITY DEFINER RPC, which returns only a minimal projection — never the
 * full row. No auth required (the RPC is granted to anon).
 */
async function SharePage({ params, searchParams }: SharePageProps) {
    const { locale } = await params;
    if (!isLocale(locale)) {
        notFound();
    }
    setRequestLocale(locale);

    const { token } = await searchParams;
    const t = await getTranslations('share');

    let shared: SharedCase | null = null;
    if (token) {
        const supabase = await createClient();
        const { data } = await supabase.rpc('get_shared_case_by_token', { p_token: token });
        if (data && typeof data === 'object') {
            shared = data as SharedCase;
        }
    }

    const rows = shared
        ? [
              { label: t('fields.legalForm'), value: shared.legal_form },
              { label: t('fields.activity'), value: shared.activity_text },
              { label: t('fields.city'), value: shared.city_name },
              { label: t('fields.revenue'), value: formatEuro(shared.revenue_y1, locale) },
              { label: t('fields.expenses'), value: formatEuro(shared.expenses_monthly, locale) },
          ]
        : [];

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{t('title')}</h1>

                {shared ? (
                    <dl className={styles.fields}>
                        {rows.map((row) => (
                            <div key={row.label} className={styles.row}>
                                <dt className={styles.term}>{row.label}</dt>
                                <dd className={styles.value}>{row.value ?? '—'}</dd>
                            </div>
                        ))}
                    </dl>
                ) : (
                    <p className={styles.notFound}>{t('notFound')}</p>
                )}

                <Link href={`/${locale}`} className={styles.back}>
                    {t('backHome')}
                </Link>
            </div>
        </div>
    );
}


export default SharePage;
