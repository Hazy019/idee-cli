import React from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function PrivacyAliasPage() {
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
      </div>
    </div>
  );
}
