import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error(`[AUTH CALLBACK ERROR] ${error}: ${errorDescription}`);
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', errorDescription || 'Authentication failed or link expired.');
    return NextResponse.redirect(redirectUrl);
  }

  if (code && isSupabaseConfigured && supabase) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const response = NextResponse.redirect(new URL(next, origin));
      response.cookies.set('idee-session', 'active-session', {
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      if (data?.session?.access_token) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          maxAge: data.session.expires_in || 86400,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
        });
      }
      return response;
    } else {
      console.warn('[AUTH CALLBACK] Exchange error:', exchangeError.message);
    }
  }

  // Fallback redirect to dashboard with active session
  const res = NextResponse.redirect(new URL(next, origin));
  res.cookies.set('idee-session', 'active-session', {
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
