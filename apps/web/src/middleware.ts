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

  // Gated dashboard and device routes requiring mandatory active session
  const isGatedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/service-tokens') ||
    pathname.startsWith('/device') ||
    pathname.startsWith('/runs');

  let res = NextResponse.next();

  if (isGatedRoute) {
    const sessionToken =
      req.cookies.get('sb-access-token')?.value ||
      req.cookies.get('idee-session')?.value ||
      req.headers.get('authorization');

    // Zero-Trust Route Guard: Redirect unauthenticated requests directly to /login
    if (!sessionToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      res = NextResponse.redirect(loginUrl);
    }
  }

  // Security Headers Enforcement (§12.2 Hardening)
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
