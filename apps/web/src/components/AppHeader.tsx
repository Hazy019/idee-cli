'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LightbulbLogo } from '@/components/LightbulbLogo';

interface MemberAvatar {
  initials: string;
  hash: string;
}

export function AppHeader() {
  const pathname = usePathname();
  const [activeMembers, setActiveMembers] = useState<MemberAvatar[]>([]);

  useEffect(() => {
    fetch('/api/telemetry-list')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
          // Extract unique machine hashes from real received telemetry logs
          const uniqueHashes = Array.from(new Set(data.logs.map((l: any) => l.machine_hash))) as string[];
          const realMembers = uniqueHashes.slice(0, 5).map((hash) => ({
            initials: hash.substring(0, 2).toUpperCase(),
            hash,
          }));
          setActiveMembers(realMembers);
        } else {
          setActiveMembers([]);
        }
      })
      .catch(() => {
        setActiveMembers([]);
      });
  }, []);

  return (
    <header className="border-b-2 border-[#002B2B] bg-[#F8F7F3] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3">
            <LightbulbLogo size="sm" />
            <span className="font-extrabold text-lg text-[#002B2B] tracking-tight">IDEE-CLI</span>
          </Link>
          <span className="text-[#002B2B]/20">/</span>
          
          <nav className="hidden sm:flex items-center space-x-3 text-xs font-bold font-mono">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-xl border-2 border-[#002B2B] transition-all ${
                pathname === '/dashboard'
                  ? 'bg-[#002B2B] text-[#88FF44] shadow-[2px_2px_0px_#002B2B]'
                  : 'bg-white text-[#002B2B] hover:bg-[#88FF44]/20'
              }`}
            >
              [Parity Grid]
            </Link>
            <Link
              href="/service-tokens"
              className={`px-3 py-1.5 rounded-xl border-2 border-[#002B2B] transition-all ${
                pathname === '/service-tokens'
                  ? 'bg-[#002B2B] text-[#88FF44] shadow-[2px_2px_0px_#002B2B]'
                  : 'bg-white text-[#002B2B] hover:bg-[#88FF44]/20'
              }`}
            >
              [Service Tokens]
            </Link>
            <Link
              href="/device"
              className={`px-3 py-1.5 rounded-xl border-2 border-[#002B2B] transition-all ${
                pathname === '/device'
                  ? 'bg-[#002B2B] text-[#88FF44] shadow-[2px_2px_0px_#002B2B]'
                  : 'bg-white text-[#002B2B] hover:bg-[#88FF44]/20'
              }`}
            >
              [Device Flow]
            </Link>
          </nav>
        </div>

        {/* Dynamic Real Member Avatar Callout (Zero Dummies) */}
        <div className="flex items-center space-x-4">
          {activeMembers.length > 0 ? (
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-white border-2 border-[#002B2B] shadow-sm">
              <div className="text-[11px] font-mono text-[#002B2B] font-bold">[Active Workstations]</div>
              <div className="flex items-center -space-x-1.5">
                {activeMembers.map((member) => (
                  <div
                    key={member.hash}
                    title={`Machine GUID: ${member.hash}`}
                    className="w-6 h-6 rounded-full border border-[#002B2B] bg-[#002B2B] flex items-center justify-center text-[9px] font-mono font-bold text-[#88FF44]"
                  >
                    {member.initials}
                  </div>
                ))}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#88FF44] border border-[#002B2B]" />
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#002B2B]/20 text-[11px] font-mono text-[#002B2B]/70">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>[0 Active Workstations]</span>
            </div>
          )}

          <Link
            href="/login"
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white text-[#002B2B] border-2 border-[#002B2B] hover:bg-red-500/10 hover:text-red-700 transition-colors"
          >
            [Sign Out]
          </Link>
        </div>
      </div>
    </header>
  );
}
