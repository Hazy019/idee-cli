'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LightbulbLogo } from '@/components/LightbulbLogo';

function TermsContent() {
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
            <h1 className="text-3xl font-extrabold text-[#002B2B] tracking-tight">[Terms of Service]</h1>
            <p className="text-xs font-mono text-[#002B2B]/70 mt-0.5">Effective Date: August 2026 &bull; Version 1.0.0</p>
          </div>
        </div>

        <Link
          href={backHref}
          className="px-4 py-2 rounded-xl bg-white text-[#002B2B] font-mono text-xs font-bold border-2 border-[#002B2B] hover:bg-[#88FF44] transition-colors stacked-card-shadow self-start sm:self-auto"
        >
          {backLabel}
        </Link>
      </div>

      {/* Detailed Legal Content Sections */}
      <div className="space-y-6 text-xs text-[#002B2B]/80 leading-relaxed font-sans bg-white p-8 rounded-2xl border-2 border-[#002B2B] stacked-card-shadow">
        
        <section className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">1. Agreement to Terms</h2>
          <p>
            By accessing or using the IDEE-CLI command-line engine, web dashboard, or API endpoints, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or engineering organization, you represent that you have authority to bind such entity to these terms.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">2. Service Description &amp; Immutable Baselines</h2>
          <p>
            IDEE-CLI provides declarative Windows developer environment reconciliation, Kahn DAG dependency resolution, and telemetry analytics. Configurations marked with <code className="font-mono text-[#002B2B] bg-[#88FF44] px-1 rounded">&quot;locked&quot;: true</code> represent immutable organization baselines and reject unauthorized local developer overrides during pre-flight checks.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">3. Workstation Identifier &amp; Data Rights</h2>
          <p>
            IDEE-CLI collects hashed workstation hardware identifiers (<code className="font-mono">MachineGuid</code> SHA-256 hashes) to bind telemetry runs securely. You retain full ownership of all baseline configurations and organization telemetry data. IDEE-CLI does not sell or share telemetry payloads with third-party advertising entities.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">4. Acceptable Use &amp; Security Integrity</h2>
          <p>
            You agree not to reverse engineer, tamper with Bearer authorization tokens, attempt replay attacks, or execute automated service tokens outside of designated organization CI/CD infrastructure. Rate limiting (60 requests/min per token) is strictly enforced on telemetry endpoints.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, IDEE-CLI shall not be liable for indirect, incidental, or consequential damages resulting from Windows package installer executions (winget), missing package dependencies, or network transmission interruptions.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#002B2B]/10 pt-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">6. Service Termination &amp; Data Export</h2>
          <p>
            You may terminate your organization account at any time. Upon termination, all active service account tokens are immediately revoked, and organization telemetry logs may be exported in JSON format before account deletion.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] p-6 font-sans dot-grid-light selection:bg-[#88FF44] selection:text-[#002B2B]">
      <Suspense fallback={<div className="text-center p-8 font-mono text-xs text-[#002B2B]/70">Loading Terms of Service...</div>}>
        <TermsContent />
      </Suspense>
    </div>
  );
}
