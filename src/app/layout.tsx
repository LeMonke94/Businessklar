import type { Metadata } from 'next';
import './global.css';


const metadata: Metadata = {
    title: 'BusinessKlar',
    description: 'Business setup orientation for founders in Germany.',
};

function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <body>
                {children}
            </body>
        </html>
    );
}

export { metadata };
export default RootLayout;