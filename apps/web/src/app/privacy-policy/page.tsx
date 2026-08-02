'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LightbulbLogo } from '@/components/LightbulbLogo';

function PrivacyContent() {
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
            <h1 className="text-3xl font-extrabold text-[#002B2B] tracking-tight">[Privacy Policy]</h1>
            <p className="text-xs font-mono text-[#002B2B]/70 mt-0.5">Transparent Data Collection &amp; Machine GUID Security Protocol</p>
          </div>
        </div>

        <Link
          href={backHref}
          className="px-4 py-2 rounded-xl bg-white text-[#002B2B] font-mono text-xs font-bold border-2 border-[#002B2B] hover:bg-[#88FF44] transition-colors stacked-card-shadow self-start sm:self-auto"
        >
          {backLabel}
        </Link>
      </div>

      {/* Detailed Privacy Content */}
      <div className="space-y-6 text-xs text-[#002B2B]/80 leading-relaxed font-sans bg-white p-8 rounded-2xl border-2 border-[#002B2B] stacked-card-shadow">
        
        <section className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">1. Data Minimization Philosophy</h2>
          <p>
            IDEE-CLI is engineered around a strict data minimization protocol. We only collect data essential to calculate dev environment parity and output execution diagnostics across your organization.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Machine Identifiers:</strong> One-way SHA-256 cryptographic hashes of the Windows <code className="font-mono">MachineGuid</code> to identify workstations uniquely without transmitting personal hardware serial numbers.</li>
            <li><strong>Telemetry Logs:</strong> Execution time in milliseconds, package installation lists, package skip lists, and package installation error reasons with winget exit codes.</li>
            <li><strong>Account Details:</strong> Work email, user full name, and organization name registered during workspace setup.</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">3. Information We Never Collect</h2>
          <p>
            We do not collect or scan personal file system contents, browser histories, private SSH keys, code repositories, or environment variable secrets outside of explicit <code className="font-mono">IDEE_SERVICE_TOKEN</code> tokens.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">4. Data Encryption &amp; Security Protections</h2>
          <p>
            All telemetry transmissions are encrypted in transit using TLS 1.3. Server-side inputs undergo aggressive HTML entity XSS sanitization before append-only logging to isolated database storage.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">5. Zero Third-Party Selling</h2>
          <p>
            We do not sell, rent, or monetize your organization&apos;s telemetry data to advertisers, data brokers, or third parties under any circumstances.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">6. Your Rights &amp; Data Deletion</h2>
          <p>
            You have the right to inspect all raw telemetry JSON payloads via the dashboard, export your organization data, or request permanent purging of your account records by contacting security@idee-cli.dev.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] p-6 font-sans dot-grid-light selection:bg-[#88FF44] selection:text-[#002B2B]">
      <Suspense fallback={<div className="text-center p-8 font-mono text-xs text-[#002B2B]/70">Loading Privacy Policy...</div>}>
        <PrivacyContent />
      </Suspense>
    </div>
  );
}
