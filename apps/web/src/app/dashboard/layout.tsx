import React from 'react';
import { AppHeader } from '@/components/AppHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B]">
      <AppHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#002B2B] py-6 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#002B2B]/70 gap-4 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#002B2B]">IDEE-CLI &bull; Organization Telemetry Grid</span>
          </div>
          <div className="flex space-x-6 text-[11px]">
            <a href="/privacy-policy" className="hover:text-[#002B2B] underline">[Privacy Policy]</a>
            <a href="/terms" className="hover:text-[#002B2B] underline">[Terms]</a>
            <a href="/security" className="hover:text-[#002B2B] underline">[Security]</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
