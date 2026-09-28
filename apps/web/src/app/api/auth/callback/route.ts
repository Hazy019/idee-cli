/**
 * /api/auth/callback/route.ts
 * ----------------------------
 * Supabase OAuth PKCE callback handler.
 *
 * Fix history:
 *   - v2: Replaced singleton browser client with @supabase/ssr server client so that
 *         the exchanged session tokens are written into the HTTP response as HttpOnly
 *         cookies that middleware can subsequently read. This resolves the Google OAuth
 *         login-loop bug where the user was sent back to the landing page after a
 *         successful OAuth handshake.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // ── Handle OAuth errors returned by the provider ──────────────────────
  if (error) {
    console.error(`[AUTH CALLBACK ERROR] ${error}: ${errorDescription}`);
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', errorDescription || 'Authentication failed or link expired.');
    return NextResponse.redirect(redirectUrl);
  }

  // ── No code present – unknown state, send to login ────────────────────
  if (!code) {
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', 'No authorization code received. Please try again.');
    return NextResponse.redirect(redirectUrl);
  }

  // ── Build a response object first; the SSR client will stamp cookies ──
  const redirectTarget = new URL(next, origin);
  const response = NextResponse.redirect(redirectTarget);

  // ── Exchange the PKCE code for a real session using the SSR client ────
  if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[AUTH CALLBACK] Code exchange failed:', exchangeError.message);
      const errUrl = new URL('/login', origin);
      errUrl.searchParams.set(
        'error',
        'Session exchange failed. The link may have expired — please sign in again.'
      );
      return NextResponse.redirect(errUrl);
    }

    // The @supabase/ssr client has already stamped the sb-* cookies via the
    // `set` hook above. We also set a lightweight sentinel cookie so our
    // middleware's fast-path check works even before the sb-* cookies arrive.
    response.cookies.set('idee-session', 'active', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // needs to be readable by client-side JS for the login redirect-check
    });

    return response;
  }

  // ── Supabase not configured (local-dev demo mode) ─────────────────────
  // In demo mode we can't exchange a real token, so we just forward the user.
  response.cookies.set('idee-session', 'active', {
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
