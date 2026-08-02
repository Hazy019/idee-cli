'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password Strength Calculation Algorithm
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak (Add numbers or symbols)', color: 'bg-red-500', text: 'text-red-600' };
      case 2:
        return { score: 2, label: 'Fair (Mix upper/lower case)', color: 'bg-amber-500', text: 'text-amber-600' };
      case 3:
        return { score: 3, label: 'Strong (Great password)', color: 'bg-emerald-500', text: 'text-emerald-700' };
      case 4:
        return { score: 4, label: 'Excellent (Maximum security)', color: 'bg-[#88FF44]', text: 'text-[#002B2B]' };
      default:
        return { score: 0, label: 'Too short (min 8 characters)', color: 'bg-red-400', text: 'text-red-500' };
    }
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!acceptedTerms) {
      setErrorMessage('You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    if (passwordStrength.score < 2) {
      setErrorMessage('Please use a stronger password (at least 8 characters with numbers or mixed case).');
      return;
    }

    setIsRegistering(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
            data: {
              full_name: fullName,
              organization_name: orgName,
            },
          },
        });

        if (error) throw error;

        document.cookie = 'idee-session=active-session; path=/; max-age=86400';

        if (data.session) {
          window.location.href = '/dashboard';
        } else {
          setSuccessMessage('Account registered successfully! Check your email to confirm registration or sign in directly.');
          setIsRegistering(false);
        }
      } else {
        document.cookie = 'idee-session=active-session; path=/; max-age=86400';
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register account.');
      setIsRegistering(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    document.cookie = 'idee-session=active-session; path=/; max-age=86400';
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      });
      if (error) setErrorMessage(error.message);
    } else {
      window.location.href = '/dashboard';
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

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-700">
              ✖ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-800">
              ✔ {successMessage}
            </div>
          )}

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

            {/* Password Strength Meter Component */}
            {password && (
              <div className="space-y-1.5 p-3 rounded-xl bg-[#002B2B]/5 border border-[#002B2B]/10">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#002B2B]">Strength:</span>
                  <span className={`font-bold ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-colors ${
                        step <= passwordStrength.score ? passwordStrength.color : 'bg-[#002B2B]/15'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Terms and Transparency Disclosures - Same Tab Navigation */}
            <div className="flex items-start space-x-3 pt-1">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#002B2B]/30 text-[#002B2B] focus:ring-[#88FF44]"
              />
              <label htmlFor="terms-checkbox" className="text-[11px] text-[#002B2B]/80 leading-snug">
                I agree to the{' '}
                <Link href="/terms?from=signup" className="font-bold underline text-[#002B2B]">
                  Terms of Service
                </Link>{' '}
                and acknowledge the{' '}
                <Link href="/privacy-policy?from=signup" className="font-bold underline text-[#002B2B]">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={isRegistering || !acceptedTerms}
              className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] disabled:opacity-50 text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B]"
            >
              {isRegistering ? '[Creating Workspace...]' : '[Create Organization Workspace]'}
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
        </div>
      </main>

      {/* Footer with Same Tab Transparency Links */}
      <footer className="max-w-7xl w-full mx-auto text-center p-6 text-xs text-[#002B2B]/60 font-mono space-y-2">
        <div>
          IDEE-CLI &bull; Declarative Dev Environment Engine &bull; All Rights Reserved
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/terms?from=signup" className="hover:underline font-semibold">Terms of Service</Link>
          <span>&bull;</span>
          <Link href="/privacy-policy?from=signup" className="hover:underline font-semibold">Privacy Policy</Link>
          <span>&bull;</span>
          <Link href="/security?from=signup" className="hover:underline font-semibold">Security Policy</Link>
        </div>
      </footer>
    </div>
  );
}
