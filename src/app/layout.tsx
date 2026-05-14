/**
 * Minimal root layout. Next.js requires *some* root layout to exist, but
 * in our i18n setup the actual <html>/<body> structure lives in the locale layout
 * 
 * This file just passes children through to satisfy Next.js's requirement.
 */

function RootLayout({ children }: { children: React.ReactNode }) {
    return children;
}


export default RootLayout;