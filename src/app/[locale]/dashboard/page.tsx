import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { isLocale } from '@/config/i18n';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseAuthCookie } from '@/lib/supabase/auth-cookie';
import { Dashboard } from '@/features/business-case/components/Dashboard';


// Cap the server-side auth check so a slow or unreachable Supabase can't hang
// the page; on timeout we treat the visitor as signed out and send them to sign-in.
const AUTH_CHECK_TIMEOUT_MS = 2500;


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

    const signInUrl = `/${locale}/sign-in?redirect=/${locale}/dashboard`;

    // Fast path: no session cookie means signed out. Redirect without touching
    // the network, so the page is instant even when Supabase is unreachable.
    const cookieStore = await cookies();
    const hasSession = cookieStore.getAll().some((cookie) => isSupabaseAuthCookie(cookie.name));
    if (!hasSession) {
        redirect(signInUrl);
    }

    // A session cookie exists — verify it and load the user. Bounded so a down
    // backend can't stall the page: on timeout or failure, treat as signed out.
    const supabase = await createClient();
    const user = await Promise.race([
        supabase.auth.getUser().then((result) => result.data.user, () => null),
        new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), AUTH_CHECK_TIMEOUT_MS);
        }),
    ]);

    if (!user) {
        redirect(signInUrl);
    }

    // Greeting name: the optional sign-up name, else the email's local part.
    const metadataName =
        typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined;
    const userName = metadataName || user.email?.split('@')[0] || '';

    return <Dashboard locale={locale} userName={userName} />;
}


export default DashboardPage;
