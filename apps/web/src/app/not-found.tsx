import React from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border-2 border-[#002B2B] rounded-2xl p-8 stacked-card-shadow space-y-4">
        <LightbulbLogo size="lg" className="mx-auto" />
        <h2 className="text-2xl font-extrabold text-[#002B2B]">[404 - Page Not Found]</h2>
        <p className="text-xs text-[#002B2B]/70 leading-relaxed">
          The requested route does not exist in the IDEE-CLI environment parity engine.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 text-xs font-extrabold rounded-xl bg-[#88FF44] text-[#002B2B] border border-[#002B2B] shadow-[2px_3px_0px_#002B2B]"
          >
            &larr; Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
