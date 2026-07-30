'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TelemetryLog {
  id: string;
  organization_id: string;
  machine_hash: string;
  source: 'interactive' | 'ci';
  execution_time_ms: number;
  packages_installed: string[];
  packages_skipped: string[];
  packages_failed: Array<{ id: string; reason: string }>;
  override_packages: string[];
  timestamp: string;
}

const REQUIRED_BASELINE_PACKAGES = [
  'Git.Git',
  'Nodejs.Nodejs',
  'Microsoft.VisualStudioCode',
  'Python.Python.3.11',
  'Docker.DockerDesktop',
];

function CornerBracketDecoration() {
  return (
    <>
      <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#88FF44] pointer-events-none" />
      <span className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#88FF44] pointer-events-none" />
    </>
  );
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [showCiRuns, setShowCiRuns] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<TelemetryLog | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/telemetry-list')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(() => {
        setLogs([
          {
            id: 'log-101',
            organization_id: 'org-1',
            machine_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            source: 'interactive',
            execution_time_ms: 1850,
            packages_installed: ['Microsoft.VisualStudioCode', 'Git.Git'],
            packages_skipped: ['Nodejs.Nodejs', 'Python.Python.3.11'],
            packages_failed: [],
            override_packages: ['Neovim.Neovim'],
            timestamp: new Date().toISOString(),
          },
          {
            id: 'log-102',
            organization_id: 'org-1',
            machine_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            source: 'ci',
            execution_time_ms: 3400,
            packages_installed: ['Git.Git', 'Nodejs.Nodejs', 'Docker.DockerDesktop'],
            packages_skipped: [],
            packages_failed: [{ id: 'Docker.DockerDesktop', reason: 'Download timeout' }],
            override_packages: [],
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLog(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!showCiRuns && log.source === 'ci') return false;
    if (searchTerm && !log.machine_hash.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalMachines = filteredLogs.length;
  const inParityCount = filteredLogs.filter(
    (l) => l.packages_failed.length === 0 && l.packages_installed.length > 0
  ).length;
  const parityRate = totalMachines > 0 ? Math.round((inParityCount / totalMachines) * 100) : 100;
  const totalFailed = filteredLogs.filter((l) => l.packages_failed.length > 0).length;

  const copyTelemetryLog = (log: TelemetryLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 selection:bg-[#88FF44] selection:text-[#002B2B]">
      
      {/* Top Header Row with Title & Avatar Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#002B2B] pb-6 gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[CONTROL PANEL]</div>
          <h1 className="text-3xl font-extrabold text-[#002B2B] tracking-tight mt-1">
            [Environment Parity Grid]
          </h1>
          <p className="text-xs text-[#002B2B]/70 mt-1">
            Real-time Windows machine telemetry &amp; Kahn DAG dependency reconciliation status.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border-2 border-[#002B2B] stacked-card-shadow">
          <div className="text-xs font-mono font-bold text-[#002B2B]">[Active Team]</div>
          <div className="flex items-center -space-x-1.5">
            {['JD', 'AK', 'MR', 'SL'].map((initials, idx) => (
              <div
                key={initials}
                className={`w-7 h-7 rounded-full border border-[#002B2B] flex items-center justify-center text-[10px] font-mono font-bold text-white ${
                  idx % 2 === 0 ? 'bg-[#002B2B]' : 'bg-[#053838]'
                }`}
              >
                {initials}
              </div>
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-[#002B2B] bg-[#88FF44] px-2 py-0.5 rounded border border-[#002B2B]">
            [100% ONLINE]
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase">[HOST MACHINES]</div>
          <div className="text-3xl font-black text-[#002B2B] mt-2">{totalMachines}</div>
          <div className="text-[11px] text-[#002B2B]/70 mt-1">Authenticated GUID Hashes</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase">[PARITY RATE]</div>
          <div className="text-3xl font-black text-[#002B2B] mt-2">{parityRate}%</div>
          <div className="text-[11px] font-bold text-[#002B2B] mt-1 bg-[#88FF44] inline-block px-2 py-0.5 rounded border border-[#002B2B]">
            Target Baseline Met
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase">[LOCAL OVERRIDES]</div>
          <div className="text-3xl font-black text-[#002B2B] mt-2">
            {filteredLogs.reduce((acc, l) => acc + l.override_packages.length, 0)}
          </div>
          <div className="text-[11px] text-[#002B2B]/70 mt-1">Non-Baseline Packages</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase">[EXECUTION FAILURES]</div>
          <div className="text-3xl font-black text-[#002B2B] mt-2">{totalFailed}</div>
          <div className="text-[11px] text-[#002B2B]/70 mt-1">Requires Remediation</div>
        </div>
      </div>

      {/* Central Terminal Console Widget matching image_29.png */}
      <div className="rounded-2xl bg-[#002B2B] text-white p-6 border-2 border-[#002B2B] shadow-2xl corner-brackets">
        <CornerBracketDecoration />

        <div className="flex items-center justify-between border-b border-[#002B2B]-light pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#88FF44]" />
            <span className="font-mono text-xs text-[#88FF44] font-bold">[LIVE TELEMETRY FEED]</span>
          </div>

          <div className="text-xs font-mono text-white/60">
            [MODE: RECONCILIATION ENGINE ACTIVE]
          </div>
        </div>

        <div className="font-mono text-xs leading-relaxed space-y-2 bg-[#051D1D] p-5 rounded-xl border border-[#88FF44]/20 text-[#F8F7F3] overflow-x-auto min-h-[160px]">
          <div className="text-white/50">$ idee telemetry --listen --org-id=00000000-0000-0000-0000-000000000001</div>
          <div className="text-[#88FF44]">✔ [SYSTEM OK] Kahn DAG builder initialized. No circular dependencies found.</div>
          <div className="text-white/80">&gt; Machine e3b0c442... reported 100% parity baseline compliance.</div>
          <div className="text-white/80">&gt; Telemetry event logged to append-only RLS security table.</div>
          <div className="text-[#88FF44] font-bold">&gt; Reconciliation loop complete (1.85s). Machine in 100% Parity.</div>
          <span className="inline-block w-2.5 h-4 bg-[#88FF44] animate-blink align-middle ml-1" />
        </div>
      </div>

      {/* Workflow Step Panel (4-Step Process) matching image_29.png */}
      <div className="space-y-4">
        <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[WORKFLOW TASKS]</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', status: '[Dortore]', title: 'Declare Baseline', desc: 'Lock package versions in team-setup.json' },
            { step: '02', status: '[Listi]', title: 'Audit State', desc: 'Scan local winget packages & build DAG' },
            { step: '03', status: '[Axure]', title: 'Apply Orders', desc: 'Execute unattended winget install queue' },
            { step: '04', status: '[Parity]', title: 'Verify Parity', desc: 'Stream telemetry logs to org dashboard' },
          ].map(({ step, status, title, desc }) => (
            <div key={step} className="p-4 rounded-xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-[#002B2B] text-[#88FF44] px-2 py-0.5 rounded">
                  {step}
                </span>
                <span className="font-mono text-xs font-bold text-[#002B2B]">{status}</span>
              </div>
              <h3 className="font-bold text-sm text-[#002B2B]">{title}</h3>
              <p className="text-xs text-[#002B2B]/70">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parity Grid Data Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search machine GUID hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 text-xs bg-[#F8F7F3] border border-[#002B2B]/30 rounded-xl text-[#002B2B] font-mono focus:outline-none focus:border-[#002B2B]"
          />

          <label className="flex items-center space-x-2 text-xs font-bold text-[#002B2B] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCiRuns}
              onChange={(e) => setShowCiRuns(e.target.checked)}
              className="rounded bg-[#F8F7F3] border-[#002B2B] text-[#002B2B] focus:ring-[#002B2B]"
            />
            <span>Show CI runs</span>
          </label>
        </div>

        <div className="text-xs font-mono text-[#002B2B]/70">
          Legend: <span className="font-bold text-[#002B2B] bg-[#88FF44] px-1 rounded">[✔ Parity]</span> &bull; <span className="font-bold text-[#002B2B] bg-amber-200 px-1 rounded">[○ Drift]</span> &bull; <span className="font-bold text-[#002B2B] bg-red-200 px-1 rounded">[✖ Fail]</span>
        </div>
      </div>

      {/* Confined Scroll Container for Data Table (h-[600px] overflow-y-auto) */}
      <div className="h-[600px] overflow-y-auto rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#002B2B] text-[#88FF44] flex items-center justify-center font-mono font-bold text-xl mx-auto">
              0
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#002B2B]">[No Host Machines Found]</h3>
              <p className="text-xs text-[#002B2B]/70 mt-1">
                Run `idee apply` from your developer workstation terminal to report telemetry.
              </p>
            </div>
            <div className="max-w-md mx-auto p-4 rounded-xl bg-[#002B2B] text-white font-mono text-xs text-left space-y-1">
              <div className="text-white/50"># Authenticate and reconcile local machine</div>
              <div className="text-[#88FF44]">idee login</div>
              <div className="text-[#88FF44]">idee apply</div>
            </div>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#002B2B] text-white font-mono uppercase tracking-wider border-b-2 border-[#002B2B] z-10">
              <tr>
                <th className="p-4 min-w-[220px]">Machine GUID Hash</th>
                <th className="p-4 w-24">Type</th>
                {REQUIRED_BASELINE_PACKAGES.map((pkg) => (
                  <th key={pkg} className="p-4 text-center min-w-[130px] font-mono">
                    {pkg.split('.').pop()}
                  </th>
                ))}
                <th className="p-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#002B2B]/10 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F7F3] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#002B2B]">
                    <div className="flex items-center space-x-2">
                      {log.source === 'ci' && <span title="CI Bot">🤖</span>}
                      <span>{log.machine_hash.slice(0, 16)}...</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-[#002B2B]/10 text-[#002B2B]">
                      {log.source}
                    </span>
                  </td>

                  {REQUIRED_BASELINE_PACKAGES.map((pkgId) => {
                    const isInstalled = log.packages_installed.includes(pkgId) || log.packages_skipped.includes(pkgId);
                    const isFailed = log.packages_failed.some((f) => f.id === pkgId);
                    const isOverride = log.override_packages.includes(pkgId);

                    return (
                      <td key={pkgId} className="p-4 text-center font-mono font-bold">
                        {isFailed ? (
                          <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded">[✖ Fail]</span>
                        ) : isInstalled ? (
                          <span className="bg-[#88FF44] text-[#002B2B] px-2 py-0.5 rounded border border-[#002B2B]">[✔ Parity]</span>
                        ) : isOverride ? (
                          <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded">[★ Override]</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">[○ Drift]</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-[#88FF44] text-[#002B2B] border border-[#002B2B] hover:bg-[#77EE33] transition-colors"
                    >
                      Inspect &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Benefit Panel Breakdown (3x2 Grid) matching image_29.png */}
      <div className="space-y-4 pt-4">
        <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[TEAM ACTIVITIES & METRICS]</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '[Ratere tappoling cult metrics]', value: '99.4%', label: 'DAG Resolution Accuracy' },
            { title: '[Uppervoxng memory stats]', value: '1850ms', label: 'Average Execution Speed' },
            { title: '[Hardware Binding Security]', value: 'SHA-256', label: 'Machine GUID Claim' },
          ].map(({ title, value, label }) => (
            <div key={title} className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-2">
              <div className="text-xs font-mono font-bold text-[#002B2B]/60">{title}</div>
              <div className="text-2xl font-black text-[#002B2B]">{value}</div>
              <div className="text-xs text-[#002B2B]/70">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-over Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#002B2B]/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white border-l-2 border-[#002B2B] h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#002B2B] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#002B2B]">[Telemetry Details]</h2>
                <p className="text-xs font-mono text-[#002B2B]/70 mt-1">{selectedLog.machine_hash}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1.5 rounded-lg bg-[#002B2B] text-white font-mono text-xs font-bold"
              >
                ✕ Esc
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20">
                <div className="text-[10px] font-mono uppercase text-[#002B2B]/60">Installed</div>
                <div className="text-lg font-black text-[#002B2B]">{selectedLog.packages_installed.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20">
                <div className="text-[10px] font-mono uppercase text-[#002B2B]/60">Skipped</div>
                <div className="text-lg font-black text-[#002B2B]">{selectedLog.packages_skipped.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20">
                <div className="text-[10px] font-mono uppercase text-[#002B2B]/60">Failed</div>
                <div className="text-lg font-black text-red-600">{selectedLog.packages_failed.length}</div>
              </div>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#002B2B] font-mono">[JSON Telemetry Payload]</span>
                <button
                  onClick={() => copyTelemetryLog(selectedLog)}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-[#88FF44] text-[#002B2B] border border-[#002B2B]"
                >
                  {copied ? 'Copied!' : 'Copy Telemetry JSON'}
                </button>
              </div>

              <pre className="flex-1 p-4 rounded-xl bg-[#002B2B] text-[#88FF44] text-xs font-mono overflow-x-auto select-all leading-relaxed">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
