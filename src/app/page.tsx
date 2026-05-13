import { env } from '@/config/env';


function HomePage() {
    return (
        <main>
            <h1>BusinessKlar</h1>
            <p>Coming soon...</p>
            <p>Supabase URL: {env.NEXT_PUBLIC_SUPABASE_URL}</p>
        </main>
    );
}

export default HomePage;