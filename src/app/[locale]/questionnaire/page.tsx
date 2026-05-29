import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/config/i18n';
import { notFound } from 'next/navigation';
import { Survey } from '@/features/questionnaire/components/Survey';


/**
 * Questionnaire route at /de/questionnaire, /en/questionnaire, /ru/questionnaire.
 *
 * Server component: validates the locale defensively (same pattern as every
 * other page), sets the request locale, then renders the client Survey shell.
 */
async function QuestionnairePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    setRequestLocale(locale);

    return <Survey />;
}


export default QuestionnairePage;