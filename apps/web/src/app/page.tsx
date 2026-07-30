'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

/* ─── Intersection-observer hook for scroll-triggered fade-up ─── */
function useFadeUp(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ─── Copy-to-clipboard hook ─────────────────────────────────── */
function useCopy(text: string, ms = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), ms);
    });
  };
  return { copied, copy };
}

/* ─── Reusable Branded Components ────────────────────────────── */
function IndexBadge({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#002B2B] font-mono text-xs font-bold text-[#88FF44] flex-shrink-0 select-none shadow-sm">
      {n}
    </span>
  );
}

function CornerBracketDecoration() {
  return (
    <>
      <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#88FF44] pointer-events-none" />
      <span className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#88FF44] pointer-events-none" />
    </>
  );
}

export default function LandingPage() {
  const [terminalTab, setTerminalTab] = useState<'audit' | 'apply'>('apply');
  const [menuOpen, setMenuOpen] = useState(false);
  const { copied, copy } = useCopy('npx idee-cli apply');

  const howRef = useFadeUp();
  const featRef = useFadeUp();
  const archRef = useFadeUp();

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        .scroll-section { opacity: 0; transform: translateY(24px); transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1); }
        .scroll-section.in-view { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B]">
        
        {/* ══ NAVBAR ═══════════════════════════════════════════════════ */}
        <header className="border-b border-[#002B2B]/10 bg-[#F8F7F3]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Brand Logo with Lightbulb */}
            <Link href="/" className="flex items-center space-x-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B] rounded-lg">
              <LightbulbLogo size="sm" />
              <span className="font-extrabold text-xl text-[#002B2B] tracking-tight">IDEE-CLI</span>
              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded bg-[#002B2B]/5 font-mono text-[#002B2B]/60 border border-[#002B2B]/10">
                v1.0.0
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <a href="#how" className="text-[#002B2B]/70 hover:text-[#002B2B] transition-colors">How it works</a>
              <a href="#features" className="text-[#002B2B]/70 hover:text-[#002B2B] transition-colors">Features</a>
              <a href="#arch" className="text-[#002B2B]/70 hover:text-[#002B2B] transition-colors">Architecture</a>
              <Link href="/docs" className="text-[#002B2B]/70 hover:text-[#002B2B] transition-colors">Docs</Link>
              <a
                href="https://github.com/Hazy019/idee-cli"
                target="_blank"
                rel="noreferrer"
                className="text-[#002B2B]/70 hover:text-[#002B2B] transition-colors flex items-center space-x-1"
              >
                <span>GitHub</span>
                <span className="text-[10px] font-mono font-bold text-[#002B2B]/50">↗</span>
              </a>
            </nav>

            {/* Distinct Header Actions: Sign In (Login) & Get Started (Signup) */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-[#002B2B]/80 hover:text-[#002B2B] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-xs font-extrabold rounded-full bg-[#88FF44] hover:bg-[#77EE33] text-[#002B2B] border border-[#002B2B] shadow-[2px_3px_0px_#002B2B] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B2B]"
              >
                [Get Started]
              </Link>
              
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg text-[#002B2B] hover:bg-[#002B2B]/5 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle Menu"
              >
                <span className={`block w-5 h-0.5 bg-current mb-1.5 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-0.5 bg-current mb-1.5 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="md:hidden border-t border-[#002B2B]/10 bg-[#F8F7F3] px-6 py-4 flex flex-col space-y-3 text-sm">
              <a href="#how" onClick={() => setMenuOpen(false)} className="text-[#002B2B]/80">How it works</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="text-[#002B2B]/80">Features</a>
              <a href="#arch" onClick={() => setMenuOpen(false)} className="text-[#002B2B]/80">Architecture</a>
              <Link href="/docs" onClick={() => setMenuOpen(false)} className="text-[#002B2B]/80">Docs</Link>
              <a href="https://github.com/Hazy019/idee-cli" target="_blank" rel="noreferrer" className="text-[#002B2B]/80">GitHub Repo ↗</a>
              <div className="pt-2 border-t border-[#002B2B]/10 flex flex-col space-y-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-[#002B2B]/80">Sign In</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="font-bold text-[#002B2B]">[Get Started]</Link>
              </div>
            </div>
          )}
        </header>

        {/* ══ HERO SECTION ═════════════════════════════════════════════ */}
        <section className="relative pt-16 pb-20 overflow-hidden dot-grid-light">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Main Hero Headline & Lightbulb Graphic (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col items-start space-y-6">
              
              {/* Central Lightbulb Icon Showcase */}
              <div className="flex items-center space-x-4 mb-2">
                <LightbulbLogo size="xl" className="animate-lime-glow" />
                <div className="text-left">
                  <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[IDEE-CLI CORE ENGINE]</div>
                  <div className="text-sm font-semibold text-[#002B2B]/80">Declarative Windows Reconciliation</div>
                </div>
              </div>

              {/* Bold / Regular Headline Hierarchy */}
              <h1 className="text-5xl sm:text-7xl font-extrabold text-[#002B2B] tracking-tight leading-[0.95]">
                Your next <span className="font-extrabold text-[#002B2B]">insight...</span>
                <br />
                <span className="font-normal text-[#002B2B]/60">[one command away].</span>
              </h1>

              <p className="text-lg text-[#002B2B]/70 max-w-2xl leading-relaxed">
                Windows-native developer environment reconciliation engine. Audits, resolves dependencies via Kahn&apos;s DAG algorithm, and installs baseline software unattended via winget.
              </p>

              {/* Interactive Copy Command CTA & Signup Link */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={copy}
                  className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-[#002B2B] text-white font-mono text-sm font-bold shadow-lg hover:bg-[#053838] transition-all"
                >
                  <span className="text-[#88FF44]">$</span>
                  <span>npx idee-cli apply</span>
                  <span className="text-xs text-[#88FF44] bg-[#88FF44]/20 px-2 py-0.5 rounded border border-[#88FF44]/30 ml-2">
                    {copied ? 'COPIED!' : 'COPY'}
                  </span>
                </button>

                <Link
                  href="/signup"
                  className="px-6 py-3 text-sm font-extrabold rounded-xl bg-[#88FF44] text-[#002B2B] border border-[#002B2B] shadow-[3px_4px_0px_#002B2B] hover:bg-[#77EE33] transition-all"
                >
                  Get Started &rarr;
                </Link>
              </div>
            </div>

            {/* Equity & User-Centered Team Status Grid Callout (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <div className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-4">
                <div className="flex items-center justify-between border-b border-[#002B2B]/10 pb-3">
                  <div className="text-xs font-mono font-bold text-[#002B2B] uppercase tracking-wider">[EQUITY & USER-CENTERED DESIGN]</div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#88FF44] border border-[#002B2B]" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#002B2B]">Open &apos;Open Dashboard&apos; Callout</h3>
                    <p className="text-xs text-[#002B2B]/70 mt-0.5">Inclusive team status grid</p>
                  </div>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#88FF44] text-[#002B2B] border border-[#002B2B]"
                  >
                    Open Dashboard
                  </Link>
                </div>

                {/* Team Avatar Callouts */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-mono text-[#002B2B]/60">[Status indicators] [Inclusive tags]</div>
                  <div className="flex items-center -space-x-2">
                    {['JD', 'AK', 'MR', 'SL', 'TH'].map((initials, idx) => (
                      <div
                        key={initials}
                        className={`w-9 h-9 rounded-full border-2 border-[#002B2B] flex items-center justify-center text-xs font-mono font-bold text-white ${
                          idx % 3 === 0 ? 'bg-[#002B2B]' : idx % 3 === 1 ? 'bg-[#053838]' : 'bg-zinc-700'
                        }`}
                      >
                        {initials}
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full border-2 border-[#002B2B] bg-[#88FF44] text-[#002B2B] flex items-center justify-center text-xs font-mono font-bold">
                      +12
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#002B2B]/70 pt-2 border-t border-[#002B2B]/10">
                  Benefit-focused copy is clean, inclusive avatar callout.
                </div>
              </div>
            </div>
          </div>

          {/* Central Console Terminal Window */}
          <div className="max-w-5xl mx-auto px-6 mt-16">
            <div className="relative rounded-2xl bg-[#002B2B] text-white p-6 sm:p-8 border-2 border-[#002B2B] shadow-2xl corner-brackets">
              <CornerBracketDecoration />

              {/* Console Header bar */}
              <div className="flex items-center justify-between border-b border-[#002B2B]-light pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444]" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#88FF44]" />
                  </div>
                  <span className="font-mono text-xs text-[#88FF44] font-bold">[IDEE-CLI TERMINAL LOG]</span>
                </div>

                <div className="flex space-x-2 font-mono text-xs">
                  <button
                    onClick={() => setTerminalTab('audit')}
                    className={`px-3 py-1 rounded-lg border ${
                      terminalTab === 'audit'
                        ? 'bg-[#88FF44] text-[#002B2B] font-bold border-[#88FF44]'
                        : 'border-[#88FF44]/30 text-[#88FF44] hover:bg-[#88FF44]/10'
                    }`}
                  >
                    [idee audit]
                  </button>
                  <button
                    onClick={() => setTerminalTab('apply')}
                    className={`px-3 py-1 rounded-lg border ${
                      terminalTab === 'apply'
                        ? 'bg-[#88FF44] text-[#002B2B] font-bold border-[#88FF44]'
                        : 'border-[#88FF44]/30 text-[#88FF44] hover:bg-[#88FF44]/10'
                    }`}
                  >
                    [idee apply]
                  </button>
                </div>
              </div>

              {/* Console Output */}
              <div className="font-mono text-xs sm:text-sm leading-relaxed space-y-3 bg-[#051D1D] p-6 rounded-xl border border-[#88FF44]/20 text-[#F8F7F3] overflow-x-auto min-h-[220px]">
                {terminalTab === 'audit' ? (
                  <>
                    <div className="text-white/50">$ idee audit --config team-setup.json</div>
                    <div className="text-[#88FF44] font-bold">======================================================</div>
                    <div className="text-[#88FF44] font-bold">idee audit &bull; Dev Environment Reconciliation Audit</div>
                    <div className="text-[#88FF44] font-bold">======================================================</div>
                    <div className="mt-2">Target Packages Total: 4</div>
                    <div>Already Installed:     2</div>
                    <div className="text-[#88FF44] font-bold">Missing Packages:       2 [Topological Order]</div>
                    <div className="mt-2 text-white/70">[Missing Packages to Install]</div>
                    <div className="text-[#88FF44]"> &bull; Nodejs.Nodejs @ 22.0.0 (depends on: Git.Git)</div>
                    <div className="text-[#88FF44]"> &bull; Microsoft.VisualStudioCode (depends on: Nodejs.Nodejs)</div>
                  </>
                ) : (
                  <>
                    <div className="text-white/50">$ idee apply --config team-setup.json</div>
                    <div className="text-[#88FF44] font-bold">======================================================</div>
                    <div className="text-[#88FF44] font-bold">idee apply &bull; Dev Environment Reconciliation Loop</div>
                    <div className="text-[#88FF44] font-bold">======================================================</div>
                    <div>Target: 4 packages | Skipped (already installed): 2</div>
                    <div>Queue: 2 packages to install in topological dependency order</div>
                    <div className="mt-2 text-white/80">Installing [Nodejs.Nodejs]...</div>
                    <div className="text-[#88FF44] font-bold"> ✔ [Nodejs.Nodejs] Installed successfully.</div>
                    <div className="text-white/80 mt-1">Installing [Microsoft.VisualStudioCode]...</div>
                    <div className="text-[#88FF44] font-bold"> ✔ [Microsoft.VisualStudioCode] Installed successfully.</div>
                    <div className="mt-3 text-[#88FF44] font-bold">✔ Reconciliation Complete (2.41s) &bull; Machine in 100% Parity.</div>
                  </>
                )}
                <span className="inline-block w-2.5 h-4 bg-[#88FF44] animate-blink align-middle ml-1" />
              </div>

              {/* Console Footer */}
              <div className="mt-4 flex items-center justify-between text-xs font-mono text-white/60">
                <div>[STATUS: PARITY ENGINE READY]</div>
                <div className="text-[#88FF44]">winget &bull; Kahn DAG Topological Engine</div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-8 py-3.5 text-sm font-extrabold rounded-full bg-[#88FF44] text-[#002B2B] border-2 border-[#002B2B] shadow-[4px_4px_0px_#002B2B] hover:bg-[#77EE33] hover:-translate-y-1 transition-all"
              >
                <span>Sign In to Dashboard</span>
                <span className="w-5 h-5 rounded-full bg-[#002B2B] text-white flex items-center justify-center text-xs">
                  &gt;
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FOUR STEP WORKFLOW SECTION ═══════════════════════════════ */}
        <section id="how" className="py-24 border-t border-[#002B2B]/10 bg-white">
          <div ref={howRef} className="max-w-7xl mx-auto px-6 scroll-section">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[WORKFLOW PIPELINE]</div>
              <h2 className="text-4xl font-extrabold text-[#002B2B] tracking-tight">
                From declaration to parity <br />
                <span className="font-normal text-[#002B2B]/70">in four steps.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { n: '01', title: '[Dortore]', desc: 'Declare your team baseline in JSON. Lock baseline package versions and definitions.' },
                { n: '02', title: '[Listi]', desc: 'Audit live host machine state against Kahn directed acyclic graph (DAG) dependency graph.' },
                { n: '03', title: '[Axure]', desc: 'Execute unattended installation sequence in topological order via native winget.' },
                { n: '04', title: '[Parity]', desc: 'Achieve 100% environment parity with append-only RLS telemetry reported to dashboard.' },
              ].map(({ n, title, desc }) => (
                <div
                  key={n}
                  className="p-6 rounded-2xl bg-[#F8F7F3] border-2 border-[#002B2B] stacked-card-shadow space-y-4 hover:-translate-y-1 transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <IndexBadge n={n} />
                    <span className="text-xs font-mono font-bold text-[#002B2B]/50">[STEP]</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#002B2B]">{title}</h3>
                  <p className="text-xs text-[#002B2B]/70 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURE LIST & ARCHITECTURE ══════════════════════════════ */}
        <section id="features" className="py-24 border-t border-[#002B2B]/10 dot-grid-light">
          <div ref={featRef} className="max-w-7xl mx-auto px-6 scroll-section">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[FEATURE MATRIX]</div>
              <h2 className="text-4xl font-extrabold text-[#002B2B] tracking-tight">
                Built for engineering teams <br />
                <span className="font-normal text-[#002B2B]/70">that ship fast.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: '[Kahn Topological Sort]',
                  desc: 'Builds a directed acyclic graph (DAG) of missing dependencies and hard-fails on circular cycles before touching host software.',
                  tag: 'Ratere tappoling cult metrics',
                },
                {
                  title: '[Locked Baseline Immutability]',
                  desc: 'Baseline packages marked locked cannot be altered by local developer overrides. Pre-flight checks exit non-zero on conflict.',
                  tag: 'Limse-heroic concealing',
                },
                {
                  title: '[Append-Only Telemetry]',
                  desc: 'Row-level security policies ensure telemetry logs are append-only. Machine GUID hashes bind tokens to physical hardware.',
                  tag: 'Uppeacking memory stats',
                },
                {
                  title: '[Execution Time Tracking]',
                  desc: 'Precise millisecond resolution telemetry logging for unattended execution loops across all developer machines.',
                  tag: 'Real-time log capture',
                },
                {
                  title: '[Machine GUID Hardware Binding]',
                  desc: 'Hashes Windows Registry MachineGuid to enforce strict single-token hardware authorization policies.',
                  tag: 'SHA-256 token security',
                },
                {
                  title: '[Winget HRESULT Error Mapping]',
                  desc: 'Maps raw Windows exit codes to human-readable remediation advice for rapid developer onboarding support.',
                  tag: 'Automated diagnostic feedback',
                },
              ].map(({ title, desc, tag }) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-4 hover:-translate-y-1 transition-transform"
                >
                  <div className="text-xs font-mono font-bold text-[#002B2B]/60">[FEATURE]</div>
                  <h3 className="text-base font-bold text-[#002B2B]">{title}</h3>
                  <p className="text-xs text-[#002B2B]/70 leading-relaxed">{desc}</p>
                  <div className="pt-2 border-t border-[#002B2B]/10 font-mono text-[11px] text-[#002B2B]/60">
                    Tag: {tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ARCHITECTURE SECTION ═════════════════════════════════════ */}
        <section id="arch" className="py-24 border-t border-[#002B2B]/10 bg-white">
          <div ref={archRef} className="max-w-7xl mx-auto px-6 scroll-section">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[SYSTEM ARCHITECTURE]</div>
              <h2 className="text-4xl font-extrabold text-[#002B2B] tracking-tight">
                Zero-Trust Security &amp; DAG Topological Graph
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="p-8 rounded-2xl bg-[#002B2B] text-white space-y-4 corner-brackets">
                <CornerBracketDecoration />
                <div className="font-mono text-xs text-[#88FF44] font-bold">[ARCHITECTURE DIAGRAM]</div>
                <div className="font-mono text-xs space-y-2 text-white/80 leading-relaxed bg-[#051D1D] p-5 rounded-xl border border-[#88FF44]/20">
                  <div>┌────────────────────────┐ &nbsp;&nbsp; HTTPS REST / WS</div>
                  <div>│ Windows Machine CLI    │ ─────────────────┐</div>
                  <div>│ (MachineGuid Token)    │                  │</div>
                  <div>└────────────────────────┘                  ▼</div>
                  <div>┌────────────────────────┐      ┌────────────────────────┐</div>
                  <div>│ Web Dashboard UI       │ ───&gt; │ Centralized Backend    │</div>
                  <div>│ (Next.js Middleware)   │      │ (Zod + XSS Sanitizer) │</div>
                  <div>└────────────────────────┘      └───────────┬────────────┘</div>
                  <div>                                            │</div>
                  <div>                                            ▼</div>
                  <div>                                ┌────────────────────────┐</div>
                  <div>                                │ Supabase PostgreSQL    │</div>
                  <div>                                │ (Append-Only RLS)      │</div>
                  <div>                                └────────────────────────┘</div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-[#F8F7F3] border-2 border-[#002B2B] stacked-card-shadow">
                <div className="text-xs font-mono font-bold text-[#002B2B] uppercase">[13 PILLARS ARCHITECTURAL ALIGNMENT]</div>
                <ul className="space-y-2 text-xs text-[#002B2B]/80 font-medium">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#88FF44] border border-[#002B2B]" />
                    <span><strong>AuthN &amp; AuthZ:</strong> Edge Middleware JWT Route Guard &amp; Machine GUID claims.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#88FF44] border border-[#002B2B]" />
                    <span><strong>Data Integrity:</strong> Append-Only database policies &amp; XSS input sanitization.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#88FF44] border border-[#002B2B]" />
                    <span><strong>Resilience:</strong> CLI self-recovery offline queue (`%APPDATA%\idee-cli\telemetry-queue.json`).</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#88FF44] border border-[#002B2B]" />
                    <span><strong>Open Source Transparency:</strong> Public GitHub repository &amp; full security audit docs.</span>
                  </li>
                </ul>
                <div className="pt-2 border-t border-[#002B2B]/10">
                  <a
                    href="https://github.com/Hazy019/idee-cli"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 text-xs font-bold text-[#002B2B] hover:underline font-mono"
                  >
                    <span>[Inspect Architecture Code on GitHub ↗]</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER SECTION ═══════════════════════════════════════════ */}
        <footer className="border-t-2 border-[#002B2B] bg-white py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#002B2B]/70 gap-6">
            
            <div className="flex items-center space-x-3">
              <LightbulbLogo size="sm" />
              <div className="font-extrabold text-sm text-[#002B2B]">
                IDEE-CLI: IDEAS, EXECUTED.
              </div>
            </div>

            <div className="flex space-x-6 font-medium">
              <Link href="/docs" className="hover:text-[#002B2B] transition-colors">Documentation</Link>
              <Link href="/privacy-policy" className="hover:text-[#002B2B] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#002B2B] transition-colors">Terms of Service</Link>
              <Link href="/security" className="hover:text-[#002B2B] transition-colors">Security Architecture</Link>
              <a
                href="https://github.com/Hazy019/idee-cli"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#002B2B] transition-colors"
              >
                GitHub Repo ↗
              </a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
