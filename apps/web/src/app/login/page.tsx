'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LightbulbLogo } from '@/components/LightbulbLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Read optional redirectTo destination (set by middleware when bouncing unauthenticated users)
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  // Detect error messages passed back from the OAuth callback
  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setErrorMessage(decodeURIComponent(err));
  }, [searchParams]);

  // Bypass login page if the user already has a valid session
  useEffect(() => {
    const err = searchParams.get('error');
    if (err) return; // Do not auto-redirect if an error was reported

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.location.replace(redirectTo);
        } else if (typeof document !== 'undefined') {
          // No active Supabase session: purge any stale sentinel cookie to prevent redirect loops
          document.cookie = 'idee-session=; path=/; max-age=0; SameSite=Lax';
        }
      });
    } else if (typeof document !== 'undefined') {
      const cookies = document.cookie;
      const hasSession = cookies.includes('idee-session=active');
      if (hasSession) {
        window.location.replace(redirectTo);
      }
    }
  }, [redirectTo, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown || loggingIn) return;

    setErrorMessage('');
    setLoggingIn(true);
    setCooldown(true);

    // 3-second submit button cooldown to prevent click spamming
    setTimeout(() => setCooldown(false), 3000);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: username,
          password,
        });

        if (error) throw error;

        // The Supabase browser client writes sb-* cookies automatically after
        // signInWithPassword. Set a lightweight sentinel for our middleware fast-path.
        document.cookie = 'idee-session=active; path=/; max-age=604800; SameSite=Lax';
        window.location.replace(redirectTo);
      } else {
        // Demo mode: simulate a session
        document.cookie = 'idee-session=active; path=/; max-age=604800; SameSite=Lax';
        setTimeout(() => {
          window.location.replace(redirectTo);
        }, 300);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
      setLoggingIn(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    // Do NOT set session cookie here — the callback route does that after
    // the real code exchange. Setting it early causes a false-positive session
    // that makes the login loop when the exchange later fails.
    if (isSupabaseConfigured && supabase) {
      // Forward the intended destination through the callback so the user
      // lands on the right page after OAuth completes.
      const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) setErrorMessage(error.message);
    } else {
      // Demo mode
      document.cookie = 'idee-session=active; path=/; max-age=604800; SameSite=Lax';
      window.location.replace(redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B] dot-grid-light">
      
      {/* Header Bar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-3">
          <LightbulbLogo size="sm" />
          <span className="font-extrabold text-lg text-[#002B2B] tracking-tight">IDEE-CLI</span>
        </Link>
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <span className="text-[#002B2B]/60">Don&apos;t have an account?</span>
          <Link href="/signup" className="text-[#002B2B] underline font-bold">
            Sign Up &rarr;
          </Link>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-md bg-white border-2 border-[#002B2B] rounded-2xl p-8 sm:p-10 stacked-card-shadow space-y-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <LightbulbLogo size="lg" className="animate-lime-glow" />
            <h1 className="text-2xl font-extrabold text-[#002B2B] tracking-tight">
              Ready for your next <span className="text-[#002B2B] font-extrabold">[insight]</span>?
            </h1>
            <p className="text-xs text-[#002B2B]/70">
              Sign in to access your organization&apos;s environment parity dashboard.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-700">
              ✖ {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#002B2B] font-mono">
                [Username or Email]
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="architect@engineering.org"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#002B2B] font-mono">
                  [Password]
                </label>
                <Link href="/forgot-password" className="text-[11px] text-[#002B2B]/70 hover:text-[#002B2B] underline font-medium">
                  Forgot?
                </Link>
              </div>

              {/* Password Input with Show/Hide Toggle Button */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#002B2B]/60 hover:text-[#002B2B] text-xs font-mono font-bold"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? '👁 Hide' : '👁 Show'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#002B2B]/5 border border-[#002B2B]/10 font-mono text-[11px] text-[#002B2B]/70">
              <span className="text-[#002B2B] font-bold">&lt;hint-structure&gt;:</span> Authenticate via CLI using <span className="text-[#002B2B] font-bold">idee login --device-code</span>
            </div>

            <button
              type="submit"
              disabled={loggingIn || cooldown}
              className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] disabled:opacity-50 text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B]"
            >
              {cooldown ? '[Please wait...]' : loggingIn ? '[Authenticating...]' : '[Sign In to Dashboard]'}
            </button>
          </form>

          {/* Social OAuth */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full border-t border-[#002B2B]/15" />
            <span className="absolute bg-white px-3 font-mono text-[10px] text-[#002B2B]/60 uppercase tracking-widest whitespace-nowrap">
              Or Continue With
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              className="py-2.5 px-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs font-bold text-[#002B2B] hover:border-[#002B2B] flex items-center justify-center space-x-2 transition-colors"
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="py-2.5 px-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs font-bold text-[#002B2B] hover:border-[#002B2B] flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Google</span>
            </button>
          </div>

          <div className="text-center pt-2 border-t border-[#002B2B]/10">
            <Link href="/device" className="text-xs font-bold text-[#002B2B] hover:underline font-mono">
              [Enter CLI Device Authorization Code &rarr;]
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center p-6 text-xs text-[#002B2B]/60 font-mono space-y-2">
        <div>
          IDEE-CLI &bull; Declarative Dev Environment Engine &bull; All Rights Reserved
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/terms?from=login" className="hover:underline font-semibold">Terms of Service</Link>
          <span>&bull;</span>
          <Link href="/privacy-policy?from=login" className="hover:underline font-semibold">Privacy Policy</Link>
          <span>&bull;</span>
          <Link href="/security?from=login" className="hover:underline font-semibold">Security Policy</Link>
        </div>
      </footer>
    </div>
  );
}
