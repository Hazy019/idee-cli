'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setStatusMessage('Password reset instructions have been sent to your email.');
      } else {
        // Dev mode simulation
        setTimeout(() => {
          setStatusMessage('[Dev Mode] Password reset instructions simulated. Check your inbox or proceed to login.');
          setIsSubmitting(false);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request password reset.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B] dot-grid-light">
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-3">
          <LightbulbLogo size="sm" />
          <span className="font-extrabold text-lg text-[#002B2B] tracking-tight">IDEE-CLI</span>
        </Link>
        <Link href="/login" className="text-xs font-bold text-[#002B2B] underline">
          &larr; Back to Sign In
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-md bg-white border-2 border-[#002B2B] rounded-2xl p-8 sm:p-10 stacked-card-shadow space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <LightbulbLogo size="md" />
            <h1 className="text-2xl font-extrabold text-[#002B2B] tracking-tight">Reset Password</h1>
            <p className="text-xs text-[#002B2B]/70">
              Enter your work email address and we will send you a password recovery link.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-700">
              ✖ {errorMessage}
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-800">
              ✔ {statusMessage}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#002B2B] font-mono">[Email Address]</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@engineering.org"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all"
            >
              {isSubmitting ? '[Sending Reset Email...]' : '[Send Password Reset Link]'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
