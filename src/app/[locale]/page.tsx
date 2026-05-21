import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/config/i18n';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/sections/Hero';
import { TrustSection } from '@/components/sections/TrustSection';


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

    return (
        <>
            <Hero locale={locale} />
            <TrustSection />
            <ObligationsSection />
        </>
    );
}


export default HomePage;