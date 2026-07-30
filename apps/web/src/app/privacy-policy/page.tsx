import React from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] p-6 font-sans dot-grid-light">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <div className="flex items-center justify-between border-b-2 border-[#002B2B] pb-4">
          <div className="flex items-center space-x-3">
            <LightbulbLogo size="sm" />
            <h1 className="text-2xl font-extrabold text-[#002B2B] tracking-tight">[Privacy Policy]</h1>
          </div>
          <Link href="/" className="text-xs font-bold text-[#002B2B]/70 hover:text-[#002B2B]">
            &larr; Back to Home
          </Link>
        </div>

        <p className="text-[#002B2B]/70 text-sm leading-relaxed">
          IDEE-CLI processes environment telemetry to calculate software parity across your organization. Machine identifiers are stored strictly as SHA-256 hashes and bound to authorization tokens.
        </p>

        <div className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow text-xs text-[#002B2B]/80 space-y-3">
          <div className="font-bold text-sm text-[#002B2B] font-mono">[Data Collection Scope]</div>
          <p>&bull; Installed package identifiers and version numbers</p>
          <p>&bull; Execution time metrics and error exit codes</p>
          <p>&bull; Hashed machine GUIDs (no raw hostname or IP exposure)</p>
        </div>
      </div>
    </div>
  );
}
