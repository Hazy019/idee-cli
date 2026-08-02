'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your new password.');
      return;
    }

    if (passwordStrength.score < 2) {
      setErrorMessage('Please choose a stronger password (min 8 characters with numbers or mixed case).');
      return;
    }

    setIsUpdating(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }

      setSuccessMessage('✔ Password updated successfully! Redirecting to sign in...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Recovery link may be expired.');
      setIsUpdating(false);
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
          Sign In &rarr;
        </Link>
      </header>

      {/* Centered Update Password Card */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-md bg-white border-2 border-[#002B2B] rounded-2xl p-8 sm:p-10 stacked-card-shadow space-y-6">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <LightbulbLogo size="lg" className="animate-lime-glow" />
            <h1 className="text-2xl font-extrabold text-[#002B2B] tracking-tight">Set New Password</h1>
            <p className="text-xs text-[#002B2B]/70 leading-relaxed">
              Enter your new secure password below to restore access to your account.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-700">
              ✖ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-800 font-bold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#002B2B] font-mono">
                [New Password]
              </label>
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
                  {showPassword ? '👁' : '👁'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#002B2B] font-mono">
                [Confirm New Password]
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B] focus:ring-2 focus:ring-[#002B2B]/20 font-sans"
              />
            </div>

            {/* Password Strength Meter */}
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

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] disabled:opacity-50 text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B]"
            >
              {isUpdating ? '[Updating Password...]' : '[Save & Update Password]'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center p-6 text-xs text-[#002B2B]/60 font-mono">
        IDEE-CLI &bull; Password Reset Security Protocol
      </footer>
    </div>
  );
}
