import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Gated dashboard routes requiring mandatory JWT session
  const isGatedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/service-tokens') ||
    pathname.startsWith('/runs');

  if (isGatedRoute) {
    const sessionToken =
      req.cookies.get('sb-access-token')?.value ||
      req.cookies.get('idee-session')?.value ||
      req.headers.get('authorization');

    // Zero-Trust Route Guard: Redirect unauthenticated requests directly to /login
    if (!sessionToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/service-tokens/:path*', '/runs/:path*'],
};
