'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LightbulbLogo } from '@/components/LightbulbLogo';

interface MemberAvatar {
  initials: string;
  hash: string;
}

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function AppHeader() {
  const pathname = usePathname();
  const [activeMembers, setActiveMembers] = useState<MemberAvatar[]>([]);

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue clearing cookies even if Supabase call fails
      }
    }
    // Clear all session-related cookies
    document.cookie = 'idee-session=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((c) => {
        const key = c.split('=')[0].trim();
        if (key.startsWith('sb-')) {
          document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
        }
      });
    }
    window.location.replace('/login');
  };

  useEffect(() => {
    fetch('/api/telemetry-list')
      .then(async (res) => {
        if (res.status === 401) return null; // Not authenticated, skip silently
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
          const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).getTime();
          
          // Filter to runs received within the last 15 minutes
          const recentLogs = data.logs.filter((l: any) => {
            const timestamp = new Date(l.timestamp).getTime();
            return timestamp >= fifteenMinutesAgo;
          });

          const targetLogs = recentLogs.length > 0 ? recentLogs : data.logs.slice(0, 1);
          const uniqueHashes = Array.from(new Set(targetLogs.map((l: any) => l.machine_hash))) as string[];

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
          <Link href="/dashboard" className="flex items-center space-x-3" title="Back to Dashboard">
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
              href="/"
              className="px-3 py-1.5 rounded-xl text-[#002B2B]/60 hover:text-[#002B2B] transition-colors"
            >
              Website ↗
            </Link>
          </nav>
        </div>

        {/* Dynamic Real Active Workstation Callout */}
        <div className="flex items-center space-x-4">
          {activeMembers.length > 0 ? (
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-white border-2 border-[#002B2B] shadow-sm">
              <div className="text-[11px] font-mono text-[#002B2B] font-bold">
                [{activeMembers.length} Active Workstation{activeMembers.length > 1 ? 's' : ''}]
              </div>
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

          <button
            onClick={handleSignOut}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white text-[#002B2B] border-2 border-[#002B2B] hover:bg-red-500/10 hover:text-red-700 transition-colors"
          >
            [Sign Out]
          </button>
        </div>
      </div>
    </header>
  );
}
