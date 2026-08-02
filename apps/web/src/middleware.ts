import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Gated dashboard routes requiring mandatory session
  const isGatedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/service-tokens') ||
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
