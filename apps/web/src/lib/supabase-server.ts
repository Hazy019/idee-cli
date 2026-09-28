/**
 * supabase-server.ts
 * -------------------
 * Creates a Supabase client that is safe to use inside Next.js Server Components,
 * Route Handlers, and Middleware. It reads/writes cookies through the Next.js
 * `cookies()` API so that auth tokens are properly persisted in the browser after
 * an OAuth code-exchange.
 *
 * IMPORTANT: import this ONLY in server-side code (route handlers, server components).
 * For client-side usage, continue to import from `@/lib/supabase`.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Route handlers may not be able to set cookies in some contexts;
            // this is a no-op fallback to prevent crashes.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above
          }
        },
      },
    }
  );
}
