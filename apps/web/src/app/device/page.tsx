'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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
    <div className="max-w-md mx-auto my-12 p-8 rounded-xl bg-surface border border-border space-y-6 text-center">
      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center font-mono font-bold text-emerald-400 text-lg">
        i
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Authorize CLI Device</h1>
        <p className="text-text-secondary text-xs mt-1">
          Confirm the code displayed in your terminal command `idee login` to grant machine access.
        </p>
      </div>

      {status === 'success' ? (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm">
          ✔ Device Authorized Successfully. You may close this tab and return to your terminal.
        </div>
      ) : (
        <form onSubmit={handleAuthorize} className="space-y-4">
          <input
            type="text"
            placeholder="ENTER 6-DIGIT CODE"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-bg border border-border rounded-lg text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />

          {status === 'error' && <div className="text-red-400 text-xs font-medium">{errorMessage}</div>}

          <button
            type="submit"
            className="w-full py-2.5 font-bold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Approve Device Session
          </button>
        </form>
      )}
    </div>
  );
}

export default function DeviceAuthorizePage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-text-secondary">Loading device authorization...</div>}>
      <DeviceAuthorizeContent />
    </Suspense>
  );
}
