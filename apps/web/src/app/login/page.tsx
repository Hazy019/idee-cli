'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 800);
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

      {/* Perfectly Centered Login Card */}
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
                <a href="#" className="text-[11px] text-[#002B2B]/60 hover:text-[#002B2B]">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20 font-sans"
              />
            </div>

            {/* Monospace Code Hint Structure */}
            <div className="p-3 rounded-lg bg-[#002B2B]/5 border border-[#002B2B]/10 font-mono text-[11px] text-[#002B2B]/70">
              <span className="text-[#002B2B] font-bold">&lt;hint-structure&gt;:</span> Authenticate via CLI using <span className="text-[#002B2B] font-bold">idee login --device-code</span>
            </div>

            {/* Primary Lime Green Button */}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B]"
            >
              {loggingIn ? '[Authenticating...]' : '[Sign In to Dashboard]'}
            </button>
          </form>

          {/* Social OAuth - Cleanly Centered Divider Line */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full border-t border-[#002B2B]/15" />
            <span className="absolute bg-white px-3 font-mono text-[10px] text-[#002B2B]/60 uppercase tracking-widest whitespace-nowrap">
              Or Continue With
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleLogin({ preventDefault: () => {} } as any)}
              className="py-2.5 px-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs font-bold text-[#002B2B] hover:border-[#002B2B] flex items-center justify-center space-x-2 transition-colors"
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleLogin({ preventDefault: () => {} } as any)}
              className="py-2.5 px-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs font-bold text-[#002B2B] hover:border-[#002B2B] flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Google</span>
            </button>
          </div>

          {/* Device Flow Shortcut Link */}
          <div className="text-center pt-2 border-t border-[#002B2B]/10">
            <Link href="/device" className="text-xs font-bold text-[#002B2B] hover:underline font-mono">
              [Enter CLI Device Authorization Code &rarr;]
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center p-6 text-xs text-[#002B2B]/40 font-mono">
        IDEE-CLI &bull; Declarative Dev Environment Engine &bull; All Rights Reserved
      </footer>
    </div>
  );
}
