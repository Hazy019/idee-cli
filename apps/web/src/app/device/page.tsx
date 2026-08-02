'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { LightbulbLogo } from '@/components/LightbulbLogo';

function DeviceAuthorizeContent() {
  const searchParams = useSearchParams();
  const [userCode, setUserCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setUserCode(codeParam);
    }
  }, [searchParams]);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCode.trim()) return;

    try {
      const res = await fetch('/api/device/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: userCode.trim(), approve: true }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to authorize device.');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 bg-white border-2 border-[#002B2B] rounded-2xl p-8 sm:p-10 stacked-card-shadow space-y-6 text-center">
      <div className="flex justify-center">
        <LightbulbLogo size="md" className="animate-lime-glow" />
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-[#002B2B] tracking-tight">Authorize CLI Device</h1>
        <p className="text-[#002B2B]/70 text-xs mt-2 leading-relaxed">
          Enter the 6-digit user code displayed in your terminal command <span className="font-mono font-bold text-[#002B2B]">idee login</span> to grant your workstation access.
        </p>
      </div>

      {status === 'success' ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-600 text-emerald-800 font-bold text-xs font-mono space-y-2">
          <div>✔ Device Authorized Successfully!</div>
          <div className="text-[11px] font-normal text-[#002B2B]/70">You may close this browser tab and return to your terminal.</div>
        </div>
      ) : (
        <form onSubmit={handleAuthorize} className="space-y-4">
          <input
            type="text"
            placeholder="ENTER 6-DIGIT CODE"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-[#F8F7F3] border-2 border-[#002B2B] rounded-xl text-[#002B2B] focus:outline-none focus:ring-2 focus:ring-[#88FF44]"
          />

          {status === 'error' && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-700">
              ✖ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-[#88FF44] hover:bg-[#77EE33] text-[#002B2B] font-extrabold text-xs uppercase tracking-wider border-2 border-[#002B2B] shadow-[3px_3px_0px_#002B2B] transition-all"
          >
            [Approve Device Session]
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-[#002B2B]/10">
        <Link href="/dashboard" className="text-xs font-mono font-bold text-[#002B2B] hover:underline">
          &larr; [Back to Dashboard]
        </Link>
      </div>
    </div>
  );
}

export default function DeviceAuthorizePage() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B]">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <Suspense fallback={<div className="text-center p-8 font-mono text-xs text-[#002B2B]/70">Loading device authorization...</div>}>
          <DeviceAuthorizeContent />
        </Suspense>
      </main>
    </div>
  );
}
