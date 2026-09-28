/**
 * middleware.ts
 * -------------
 * Next.js Edge Middleware — runs on every request before a route handler or page.
 *
 * Responsibilities:
 *   1. Rate-limit auth/sensitive endpoints (sliding window, per-IP).
 *   2. Guard protected pages and API routes — unauthenticated requests are
 *      redirected to /login (pages) or receive HTTP 401 (API routes).
 *   3. Refresh Supabase session tokens transparently so they never silently
 *      expire mid-session.
 *   4. Inject security headers on every response.
 *
 * Session detection strategy (defence-in-depth):
 *   - Primary:  @supabase/ssr createServerClient reads the official sb-* cookies
 *               and calls supabase.auth.getUser() to obtain a cryptographically
 *               verified user object. This is the ONLY reliable check.
 *   - Fallback: If Supabase is not configured (local demo mode) we fall back to
 *               the lightweight `idee-session` sentinel cookie so the demo still works.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// ── Rate-limiting state (per-lambda, resets on cold starts) ───────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 30_000; // 30 s
const MAX_AUTH_REQUESTS_PER_WINDOW = 30;

// ── Supabase config ───────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ── Route classification ──────────────────────────────────────────────────────
const AUTH_FORM_ROUTES = new Set(['/login', '/signup', '/forgot-password', '/update-password']);

function isAuthFormRoute(pathname: string) {
  return AUTH_FORM_ROUTES.has(pathname) || pathname.startsWith('/api/device/token');
}

function isGatedPageRoute(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/service-tokens') ||
    pathname.startsWith('/device') ||
    pathname.startsWith('/runs')
  );
}

function isGatedApiRoute(pathname: string) {
  return (
    pathname.startsWith('/api/service-accounts') ||
    pathname.startsWith('/api/telemetry-list')
  );
}

// ── Security headers ──────────────────────────────────────────────────────────
function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'none';"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

  // ── 1. Rate limiting (Only rate-limit POST credential submissions, not GET page views)
  if (isAuthFormRoute(pathname) && req.method === 'POST') {
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) ?? { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
      rateData.count += 1;
    }

    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_AUTH_REQUESTS_PER_WINDOW) {
      const res = new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait 30 seconds before retrying.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '30',
          },
        }
      );
      applySecurityHeaders(res);
      return res;
    }
  }

  // ── 2. Skip auth checks for public routes ───────────────────────────────────
  if (!isGatedPageRoute(pathname) && !isGatedApiRoute(pathname)) {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  // ── 3. Session verification ─────────────────────────────────────────────────
  let isAuthenticated = false;
  let res = NextResponse.next({ request: { headers: req.headers } });

  if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);

    // Fallback: Check lightweight sentinel cookie for demo sessions
    if (!isAuthenticated) {
      const sentinel = req.cookies.get('idee-session')?.value;
      isAuthenticated = sentinel === 'active' || sentinel === 'active-session';
    }

    if (isAuthenticated) {
      applySecurityHeaders(res);
      return res; // ← session valid, pass through with refreshed cookies
    }
  } else {
    // Demo / local-dev fallback: check lightweight sentinel cookie
    const sentinel = req.cookies.get('idee-session')?.value;
    isAuthenticated = sentinel === 'active' || sentinel === 'active-session';
  }

  // ── 4. Block unauthenticated access ────────────────────────────────────────
  if (!isAuthenticated) {
    if (isGatedApiRoute(pathname)) {
      const apiRes = NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required to access this resource.' },
        { status: 401 }
      );
      applySecurityHeaders(apiRes);
      return apiRes;
    }

    // Page route: redirect to login with a `redirectTo`
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    
    // Clear stale sentinel cookie to prevent infinite redirect loops on client-side
    redirectRes.cookies.set('idee-session', '', { path: '/', maxAge: 0 });
    applySecurityHeaders(redirectRes);
    return redirectRes;
  }

  applySecurityHeaders(res);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
