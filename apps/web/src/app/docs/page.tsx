'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'config' | 'architecture' | 'api'>('quickstart');

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B] dot-grid-light">
      
      {/* Header */}
      <header className="border-b border-[#002B2B]/10 bg-[#F8F7F3] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <LightbulbLogo size="sm" />
            <span className="font-extrabold text-lg text-[#002B2B] tracking-tight">IDEE-CLI DOCS</span>
          </Link>

          <div className="flex items-center space-x-6 text-xs font-bold">
            <a href="https://github.com/Hazy019/idee-cli" target="_blank" rel="noreferrer" className="text-[#002B2B]/70 hover:text-[#002B2B]">
              GitHub Repo ↗
            </a>
            <Link href="/login" className="px-4 py-2 rounded-full bg-[#88FF44] text-[#002B2B] border border-[#002B2B]">
              [Sign In to Dashboard]
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto p-6 py-12 flex-1 space-y-8">
        
        {/* Title */}
        <div className="space-y-2 border-b-2 border-[#002B2B] pb-6">
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[TRANSPARENT SYSTEM DOCUMENTATION]</div>
          <h1 className="text-4xl font-extrabold text-[#002B2B] tracking-tight">
            IDEE-CLI Technical Manual &amp; Specification
          </h1>
          <p className="text-sm text-[#002B2B]/70 max-w-3xl leading-relaxed">
            Everything you need to know about setting up team environment baseline configs, Kahn topological sorting, winget package management, and append-only telemetry.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 border-b border-[#002B2B]/10 pb-4">
          {[
            { id: 'quickstart', label: '[01 Quickstart Guide]' },
            { id: 'config', label: '[02 Configuration Schema]' },
            { id: 'architecture', label: '[03 Kahn DAG Engine]' },
            { id: 'api', label: '[04 Telemetry API]' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                activeTab === id
                  ? 'bg-[#002B2B] text-[#88FF44] border-[#002B2B]'
                  : 'bg-white text-[#002B2B]/70 border-[#002B2B]/20 hover:border-[#002B2B]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-4">
                <h2 className="text-xl font-extrabold text-[#002B2B]">[Quickstart: 3-Step Setup]</h2>
                <div className="space-y-4 text-xs text-[#002B2B]/80 leading-relaxed font-mono">
                  <div className="p-4 rounded-xl bg-[#002B2B] text-white space-y-1">
                    <div className="text-[#88FF44] font-bold"># Step 1: Install IDEE-CLI globally or run via npx</div>
                    <div>npx idee-cli audit --config team-setup.json</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#002B2B] text-white space-y-1">
                    <div className="text-[#88FF44] font-bold"># Step 2: Authenticate your workstation</div>
                    <div>idee login</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#002B2B] text-white space-y-1">
                    <div className="text-[#88FF44] font-bold"># Step 3: Reconcile host machine environment</div>
                    <div>idee apply --config team-setup.json</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-4">
              <h2 className="text-xl font-extrabold text-[#002B2B]">[team-setup.json Schema Definition]</h2>
              <pre className="p-4 rounded-xl bg-[#002B2B] text-[#88FF44] text-xs font-mono overflow-x-auto leading-relaxed">
{`{
  "$schema": "https://idee-cli.dev/schema/v1.json",
  "team": "Engineering Core",
  "version": "1.0.0",
  "packages": [
    {
      "id": "Git.Git",
      "version": "2.45.0",
      "locked": true
    },
    {
      "id": "Nodejs.Nodejs",
      "version": "22.0.0",
      "dependsOn": ["Git.Git"],
      "locked": true
    },
    {
      "id": "Microsoft.VisualStudioCode",
      "dependsOn": ["Nodejs.Nodejs"],
      "locked": false
    }
  ]
}`}
              </pre>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-4">
              <h2 className="text-xl font-extrabold text-[#002B2B]">[Kahn DAG Dependency Resolution Invariants]</h2>
              <div className="space-y-3 text-xs text-[#002B2B]/80 leading-relaxed">
                <p>&bull; <strong>Cycle Detection:</strong> Hard-fails on circular dependency chains (e.g. A &rarr; B &rarr; A) before invoking winget.</p>
                <p>&bull; <strong>Locked Baseline Immutability:</strong> Packages marked <code>"locked": true</code> reject local developer overrides during pre-flight checks.</p>
                <p>&bull; <strong>Process Execution:</strong> Directly executes <code>winget.exe</code> via Node <code>execFile</code> with array arguments (no shell injection vulnerability).</p>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-4">
              <h2 className="text-xl font-extrabold text-[#002B2B]">[POST /api/telemetry Security Contract]</h2>
              <div className="space-y-3 text-xs text-[#002B2B]/80 leading-relaxed font-mono">
                <p>Header: <code>Authorization: Bearer &lt;machine-token&gt;</code></p>
                <p>Validation: Zod payload schema verification + sliding window rate limiting + HTML entity XSS sanitization.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#002B2B] bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[#002B2B]/70">
          <div>IDEE-CLI Documentation &bull; All Rights Reserved</div>
          <a href="https://github.com/Hazy019/idee-cli" target="_blank" rel="noreferrer" className="hover:underline font-bold">
            GitHub Repository ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
