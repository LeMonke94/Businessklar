import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/config/i18n';
import { Report } from '@/features/report/Report';


type ReportPageProps = {
    params: Promise<{ locale: string }>;
};

async function ReportPage({ params }: ReportPageProps) {
    const { locale } = await params;
    if (!isLocale(locale)) {
        notFound();
    }
    setRequestLocale(locale);

    return <Report />;
}


export default ReportPage;