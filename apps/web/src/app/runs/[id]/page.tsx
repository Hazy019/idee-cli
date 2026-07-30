'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';

export default function RunDrillDownPage({ params }: { params: { id: string } }) {
  // Demo run drill-down details
  const mockRun = {
    id: params.id,
    organization_id: '00000000-0000-0000-0000-000000000001',
    machine_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    source: 'interactive',
    execution_time_ms: 1850,
    packages_installed: ['Microsoft.VisualStudioCode', 'Git.Git'],
    packages_skipped: ['Nodejs.Nodejs', 'Python.Python.3.11'],
    packages_failed: [],
    override_packages: ['Neovim.Neovim'],
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-yellow-400 text-xs font-semibold">
          ← Back to Dashboard
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-yellow-400 font-mono text-xs">{params.id}</span>
      </div>

      <div className="glass-card p-6 rounded-xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-4 gap-2">
          <div>
            <h1 className="text-2xl font-black text-white">Reconciliation Run Drill-down</h1>
            <p className="text-gray-400 text-xs font-mono mt-1">Machine: {mockRun.machine_hash}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {mockRun.source.toUpperCase()} RUN
            </span>
            <span className="px-3 py-1 rounded bg-dark-700 text-gray-300 text-xs font-mono">
              {(mockRun.execution_time_ms / 1000).toFixed(2)}s
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-900/60 p-4 rounded-lg border border-gray-800">
            <h3 className="text-xs font-bold uppercase text-emerald-400">Newly Installed ({mockRun.packages_installed.length})</h3>
            <ul className="mt-2 space-y-1 text-xs font-mono text-gray-300">
              {mockRun.packages_installed.map((pkg) => (
                <li key={pkg} className="flex items-center space-x-2">
                  <span className="text-emerald-400">✔</span>
                  <span>{pkg}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-dark-900/60 p-4 rounded-lg border border-gray-800">
            <h3 className="text-xs font-bold uppercase text-gray-400">Skipped (Already Installed) ({mockRun.packages_skipped.length})</h3>
            <ul className="mt-2 space-y-1 text-xs font-mono text-gray-400">
              {mockRun.packages_skipped.map((pkg) => (
                <li key={pkg} className="flex items-center space-x-2">
                  <span className="text-gray-500">⁃</span>
                  <span>{pkg}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-dark-900/60 p-4 rounded-lg border border-gray-800">
            <h3 className="text-xs font-bold uppercase text-amber-400">Local Overrides ({mockRun.override_packages.length})</h3>
            <ul className="mt-2 space-y-1 text-xs font-mono text-amber-300">
              {mockRun.override_packages.map((pkg) => (
                <li key={pkg} className="flex items-center space-x-2">
                  <span className="text-amber-400">★</span>
                  <span>{pkg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
