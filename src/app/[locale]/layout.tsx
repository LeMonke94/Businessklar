import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { locales, isLocale } from '@/config/i18n';
import '../globals.css';


// Tells Next.js to pre-render this layout (and the pages below it) statically for every locale at build time.
// Returns shape: [{ locale: 'de' }, { locale: 'en' }, { locale: 'ru' }]
function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }>; }) {
    const { locale } = await params;

    // Locale comes from the URL as an untrusted string.
    if (!isLocale(locale)) {
        notFound();
    }

    // Tells next-intl which language the current server render is for
    setRequestLocale(locale);

    // Loads the matching JSON file
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}


export { generateStaticParams };
export default LocaleLayout;