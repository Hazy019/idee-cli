'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
        });

        if (error) throw error;
      }

      setMessage('✔ Password reset instructions have been sent to your email address.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <Link href="/login" className="text-xs font-bold text-[#002B2B] underline">
          &larr; Back to Sign In
        </Link>
      </header>

      {/* Centered Reset Card */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-md bg-white border-2 border-[#002B2B] rounded-2xl p-8 sm:p-10 stacked-card-shadow space-y-6">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <LightbulbLogo size="lg" className="animate-lime-glow" />
            <h1 className="text-2xl font-extrabold text-[#002B2B] tracking-tight">Reset Password</h1>
            <p className="text-xs text-[#002B2B]/70 leading-relaxed">
              Enter your work email address and we will send you a secure password recovery link.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-700">
              ✖ {errorMessage}
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-600 text-xs font-mono text-emerald-800 font-bold space-y-1">
              <div>{message}</div>
              <div className="text-[11px] font-normal text-[#002B2B]/70">
                Click the recovery link in the email to set a new password.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#002B2B] font-mono">
                [Email Address]
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@engineering.org"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] disabled:opacity-50 text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B]"
            >
              {isSubmitting ? '[Sending Reset Email...]' : '[Send Password Reset Link]'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#002B2B]/10">
            <Link href="/login" className="text-xs font-bold text-[#002B2B] hover:underline font-mono">
              &larr; Remember your password? Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center p-6 text-xs text-[#002B2B]/60 font-mono">
        IDEE-CLI &bull; Password Recovery Protocol
      </footer>
    </div>
  );
}
