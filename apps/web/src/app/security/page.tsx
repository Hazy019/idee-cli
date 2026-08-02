'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LightbulbLogo } from '@/components/LightbulbLogo';

function SecurityContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  
  const backHref = from === 'signup' ? '/signup' : from === 'login' ? '/login' : '/';
  const backLabel = from === 'signup' ? '[← Back to Sign Up]' : from === 'login' ? '[← Back to Sign In]' : '[← Back to Home]';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#002B2B] pb-6 gap-4">
        <div className="flex items-center space-x-3">
          <LightbulbLogo size="md" />
          <div>
            <h1 className="text-3xl font-extrabold text-[#002B2B] tracking-tight">[Security Architecture]</h1>
            <p className="text-xs font-mono text-[#002B2B]/70 mt-0.5">PKCE Auth, Machine GUID SHA-256 Binding &amp; Zero-Trust Protocols</p>
          </div>
        </div>

        <Link
          href={backHref}
          className="px-4 py-2 rounded-xl bg-white text-[#002B2B] font-mono text-xs font-bold border-2 border-[#002B2B] hover:bg-[#88FF44] transition-colors stacked-card-shadow self-start sm:self-auto"
        >
          {backLabel}
        </Link>
      </div>

      {/* Detailed Security Content */}
      <div className="space-y-6 text-xs text-[#002B2B]/80 leading-relaxed font-sans bg-white p-8 rounded-2xl border-2 border-[#002B2B] stacked-card-shadow">
        
        <section className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">1. Machine GUID Cryptographic Binding</h2>
          <p>
            Every telemetry transmission validates token binding against your workstation&apos;s SHA-256 Machine GUID hash. Tokens generated for Machine A cannot be replayed from Machine B, returning an immediate HTTP 403 Security Violation on hash mismatch.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">2. PKCE Authentication Flow</h2>
          <p>
            OAuth 2.0 and password reset links utilize Proof Key for Code Exchange (PKCE). Authorization codes are dynamically exchanged server-side at <code className="font-mono">/api/auth/callback</code> to eliminate authorization code interception or URL hash alteration attacks.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">3. Append-Only Database Audit Logs</h2>
          <p>
            Telemetry and security event tables implement Row Level Security (RLS) policies allowing strictly <code className="font-mono">INSERT</code> and <code className="font-mono">SELECT</code> operations. Log entries cannot be mutated or deleted by standard organization users.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">4. Rate Limiting &amp; Edge Protection</h2>
          <p>
            All API endpoints enforce sliding-window rate limiting (60 requests/minute per Bearer token) and return HTTP 429 upon threshold breach to protect against denial-of-service attempts.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] p-6 font-sans dot-grid-light selection:bg-[#88FF44] selection:text-[#002B2B]">
      <Suspense fallback={<div className="text-center p-8 font-mono text-xs text-[#002B2B]/70">Loading Security Policy...</div>}>
        <SecurityContent />
      </Suspense>
    </div>
  );
}
