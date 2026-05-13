import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';


const metadata: Metadata = {
    title: 'BusinessKlar',
    description: 'Business setup orientation for founders in Germany.',
};

function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <body>
                <QueryProvider>
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}


export { metadata };
export default RootLayout;