import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';


const env = createEnv({
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.url(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    },
    server: {
        // ...
    },
    // Next.js statically replaces `process.env.NEXT_PUBLIC_*` variables at build time.
    // Because of this replacement, dynamic object lookups fail in the browser.
    // We must manually map them here so the validation library can read and validate them.
    runtimeEnv: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    emptyStringAsUndefined: true,
});


export { env };