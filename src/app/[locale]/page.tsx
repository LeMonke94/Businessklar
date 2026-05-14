import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isLocale } from '@/config/i18n';
import { notFound } from 'next/navigation';


/**
 * Home page rendered at /de, /en, /ru.
 * 
 * Defensively re-validates the locale and re-sets the request locale
 */
async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Defensive: the layout already checks this, but pages are independent
    // render contexts and shouldn't rely on layouts having run first.
    if (!isLocale(locale)) {
        notFound();
    }

    setRequestLocale(locale);

    // Scopes translations to the 'home' namespace — so t('title') resolves home.title, not the full path.
    const t = await getTranslations('home');

    return (
        <main>
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
        </main>
    );
}


export default HomePage;