'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
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
          <span className="text-[#002B2B]/60">Already have an account?</span>
          <Link href="/login" className="text-[#002B2B] underline font-bold">
            Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Centered Signup Card */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-lg bg-white border-2 border-[#002B2B] rounded-2xl p-8 sm:p-10 stacked-card-shadow space-y-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <LightbulbLogo size="md" className="animate-lime-glow" />
            <h1 className="text-2xl font-extrabold text-[#002B2B] tracking-tight">
              Create Your <span className="text-[#002B2B] font-extrabold">[IDEE-CLI]</span> Account
            </h1>
            <p className="text-xs text-[#002B2B]/70">
              Start enforcing declarative environment parity across your engineering team.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#002B2B] font-mono">
                  [Full Name]
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#002B2B] font-mono">
                  [Work Email]
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#002B2B] font-mono">
                  [Organization Name]
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Engineering"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#002B2B] font-mono">
                  [Password]
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#002B2B]/5 border border-[#002B2B]/10 font-mono text-[11px] text-[#002B2B]/70">
              <span className="text-[#002B2B] font-bold">&lt;policy&gt;:</span> Creating an account provisions an isolated organization workspace with hardware MachineGuid token binding enabled.
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B]"
            >
              {isRegistering ? '[Creating Workspace...]' : '[Create Free Organization Workspace]'}
            </button>
          </form>

          {/* Social OAuth */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-[#002B2B]/15" />
            <span className="absolute bg-white px-3 font-mono text-[10px] text-[#002B2B]/60 uppercase tracking-widest whitespace-nowrap">
              Or Register With
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSignup({ preventDefault: () => {} } as any)}
              className="py-2.5 px-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs font-bold text-[#002B2B] hover:border-[#002B2B] flex items-center justify-center space-x-2 transition-colors"
            >
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleSignup({ preventDefault: () => {} } as any)}
              className="py-2.5 px-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs font-bold text-[#002B2B] hover:border-[#002B2B] flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Google</span>
            </button>
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
