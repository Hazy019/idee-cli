import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sliding-window rate limiting cache in memory
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30 seconds
const MAX_AUTH_REQUESTS_PER_WINDOW = 10; // 10 attempts per 30s window

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

  // Auth & sensitive form routes requiring rate limit guardrails
  const isAuthFormRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password' ||
    pathname === '/device' ||
    pathname.startsWith('/api/device/token');

  // Enforce rate limiting across ALL methods (GET, POST) for auth routes
  if (isAuthFormRoute) {
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
      rateData.count += 1;
    }

    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_AUTH_REQUESTS_PER_WINDOW) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded for authentication endpoints. Please wait 30 seconds before retrying.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '30',
          },
        }
      );
    }
  }

  // Gated dashboard, device, and sensitive data API routes requiring mandatory active session
  const isGatedPageRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/service-tokens') ||
    pathname.startsWith('/device') ||
    pathname.startsWith('/runs');

  const isGatedApiRoute =
    pathname.startsWith('/api/service-accounts') ||
    pathname.startsWith('/api/telemetry-list');

  let res = NextResponse.next();

  // Detect active session across custom session cookies, legacy sb tokens, and modern chunked Supabase cookies
  const hasSbCookie = req.cookies.getAll().some((c) => c.name.startsWith('sb-'));
  const sessionToken =
    req.cookies.get('sb-access-token')?.value ||
    req.cookies.get('idee-session')?.value ||
    (hasSbCookie ? 'supabase-auth-cookie' : null) ||
    req.headers.get('authorization');

  if (isGatedApiRoute && !sessionToken) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized', message: 'Authentication required to access this resource.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (isGatedPageRoute && !sessionToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    res = NextResponse.redirect(loginUrl);
  }

  // Security Headers Enforcement (§12.2 Hardening, CSP, HSTS, X-Frame-Options)
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

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
