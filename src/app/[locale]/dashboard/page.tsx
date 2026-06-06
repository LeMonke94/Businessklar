import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/config/i18n';
import { createClient } from '@/lib/supabase/server';
import { Dashboard } from '@/features/business-case/components/Dashboard';


type DashboardPageProps = {
    params: Promise<{ locale: string }>;
};

/**
 * Account dashboard. Protected route: the auth check runs on the server via the
 * Supabase server client (the new app's pattern), and unauthenticated visitors
 * are redirected to /sign-in with a return path. The case list itself is loaded
 * client-side by the Dashboard island.
 */
async function DashboardPage({ params }: DashboardPageProps) {
    const { locale } = await params;
    if (!isLocale(locale)) {
        notFound();
    }
    setRequestLocale(locale);

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/sign-in?redirect=/${locale}/dashboard`);
    }

    // Greeting name: the optional sign-up name, else the email's local part.
    const metadataName =
        typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined;
    const userName = metadataName || user.email?.split('@')[0] || '';

    return <Dashboard locale={locale} userName={userName} />;
}


export default DashboardPage;
