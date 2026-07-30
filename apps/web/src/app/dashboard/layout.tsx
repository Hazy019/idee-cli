import React from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B]">
      
      {/* Dashboard Top Header Navigation Bar */}
      <header className="border-b border-[#002B2B]/10 bg-[#F8F7F3] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Nav */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3">
              <LightbulbLogo size="sm" />
              <span className="font-extrabold text-lg text-[#002B2B] tracking-tight">IDEE-CLI</span>
            </Link>
            <span className="text-[#002B2B]/20">/</span>
            
            <nav className="hidden sm:flex items-center space-x-4 text-xs font-bold font-mono">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-[#002B2B] text-[#88FF44]">
                [Parity Grid]
              </Link>
              <Link href="/service-tokens" className="px-3 py-1.5 rounded-lg text-[#002B2B]/70 hover:bg-[#002B2B]/5">
                [Service Tokens]
              </Link>
              <Link href="/device" className="px-3 py-1.5 rounded-lg text-[#002B2B]/70 hover:bg-[#002B2B]/5">
                [Device Flow]
              </Link>
            </nav>
          </div>

          {/* Inclusive Team Status Grid Avatar Callout (matching image_29.png) */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-white border border-[#002B2B]/20 shadow-sm">
              <div className="text-[11px] font-mono text-[#002B2B]/60 font-bold">[Engineering Org]</div>
              <div className="flex items-center -space-x-1.5">
                {['JD', 'AK', 'MR', 'SL'].map((initials, idx) => (
                  <div
                    key={initials}
                    className={`w-6 h-6 rounded-full border border-[#002B2B] flex items-center justify-center text-[9px] font-mono font-bold text-white ${
                      idx % 2 === 0 ? 'bg-[#002B2B]' : 'bg-[#053838]'
                    }`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="w-2 h-2 rounded-full bg-[#88FF44] border border-[#002B2B]" />
            </div>

            <Link
              href="/login"
              className="text-xs font-bold text-[#002B2B]/70 hover:text-[#002B2B]"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#002B2B]/10 py-6 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#002B2B]/60 gap-4">
          <div className="flex items-center space-x-2">
            <LightbulbLogo size="sm" />
            <span className="font-bold text-[#002B2B]">IDEE-CLI &bull; Organization Telemetry Grid</span>
          </div>
          <div className="flex space-x-6 font-mono text-[11px]">
            <Link href="/privacy-policy" className="hover:text-[#002B2B]">[Privacy Policy]</Link>
            <Link href="/terms" className="hover:text-[#002B2B]">[Terms]</Link>
            <Link href="/security" className="hover:text-[#002B2B]">[Security]</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
