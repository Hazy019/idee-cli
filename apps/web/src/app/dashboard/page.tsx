'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  useEffect(() => {
    setMounted(true);
    fetch('/api/telemetry-list')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else {
          setLogs([]);
        }
      })
      .catch(() => {
        setLogs([]);
      });
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const copyTelemetryLog = (log: TelemetryLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 selection:bg-[#88FF44] selection:text-[#002B2B]">
      
      {/* Top Header Row with Title & Active Workstations Callout */}
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
          <div className="text-xs font-mono font-bold text-[#002B2B]">[Active Telemetry Stream]</div>
          <span className="text-xs font-mono font-bold text-[#002B2B] bg-[#88FF44] px-2 py-0.5 rounded border border-[#002B2B]">
            {logs.length > 0 ? `[${logs.length} RUNS INGESTED]` : '[READY FOR RUNS]'}
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase">[HOST MACHINES]</div>
          <div className="text-3xl font-black text-[#002B2B] mt-2">{totalMachines}</div>
          <div className="text-[11px] text-[#002B2B]/70 mt-1">Authenticated Machine GUID Hashes</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow">
          <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase">[PARITY RATE]</div>
          <div className="text-3xl font-black text-[#002B2B] mt-2">{parityRate}%</div>
          <div className="text-[11px] font-bold text-[#002B2B] mt-1 bg-[#88FF44] inline-block px-2 py-0.5 rounded border border-[#002B2B]">
            Target Baseline Compliance
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

      {/* Central Terminal Console Widget */}
      <div className="rounded-2xl bg-[#002B2B] text-white p-6 border-2 border-[#002B2B] shadow-2xl corner-brackets relative">
        <CornerBracketDecoration />

        <div className="flex items-center justify-between border-b border-[#002B2B]/40 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
            <span className="font-mono text-xs text-[#88FF44] font-bold ml-2">[LIVE TELEMETRY FEED]</span>
          </div>
          <div className="font-mono text-[11px] text-white/50">[MODE: RECONCILIATION ENGINE ACTIVE]</div>
        </div>

        <div className="font-mono text-xs space-y-2 text-white/80 leading-relaxed overflow-x-auto p-2">
          <div className="text-white/40">$ idee telemetry --listen --org-id=00000000-0000-0000-0000-000000000001</div>
          {logs.length > 0 ? (
            <div className="text-[#88FF44] font-bold">
              ✔ [{logs.length} Telemetry Payload Events Ingested] Ready for live updates.
            </div>
          ) : (
            <div className="text-amber-400">
              ⚡ Waiting for workstation telemetry... Run `idee apply --config team-setup.json` in CLI.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Telemetry Table Container with Clean Pagination */}
      <div className="rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search machine GUID hash..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F3] border border-[#002B2B]/20 text-xs font-mono text-[#002B2B] placeholder:text-[#002B2B]/40 focus:outline-none focus:border-[#002B2B]"
            />
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCiRuns}
                onChange={(e) => {
                  setShowCiRuns(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded border-[#002B2B] text-[#002B2B] focus:ring-[#88FF44]"
              />
              <span className="text-[#002B2B]/80 font-bold">Show CI runs</span>
            </label>

            <div className="hidden lg:flex items-center space-x-2 text-[11px] text-[#002B2B]/60">
              <span>Legend:</span>
              <span className="px-1.5 py-0.5 rounded bg-[#88FF44] text-[#002B2B] font-bold border border-[#002B2B]">
                [✔ Parity]
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold border border-amber-800">
                [⚠ Drift]
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-200 text-red-900 font-bold border border-red-800">
                [✖ Fail]
              </span>
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-mono border-2 border-dashed border-[#002B2B]/20 rounded-xl">
            <div className="text-sm font-bold text-[#002B2B]">No Workstation Telemetry Logs Received</div>
            <div className="text-xs text-[#002B2B]/60 max-w-md mx-auto leading-relaxed">
              Run your first reconciliation in terminal:
              <br />
              <code className="text-[#002B2B] font-bold bg-[#88FF44] px-2 py-0.5 rounded mt-1 inline-block border border-[#002B2B]">
                idee apply --config team-setup.json
              </code>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border-2 border-[#002B2B] rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#002B2B] text-white uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Machine GUID Hash</th>
                    <th className="p-3.5">Type</th>
                    {REQUIRED_BASELINE_PACKAGES.map((pkg) => (
                      <th key={pkg} className="p-3.5 text-center">
                        {pkg.split('.')[pkg.split('.').length - 1].toUpperCase()}
                      </th>
                    ))}
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#002B2B]/10 bg-white">
                  {paginatedLogs.map((log) => {
                    const hasFailed = log.packages_failed.length > 0;
                    return (
                      <tr key={log.id} className="hover:bg-[#F8F7F3] transition-colors">
                        <td className="p-3.5 font-bold text-[#002B2B]">
                          {log.machine_hash.substring(0, 16)}...
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-[#002B2B]/5 text-[#002B2B] text-[10px] font-bold border border-[#002B2B]/20 uppercase">
                            {log.source}
                          </span>
                        </td>

                        {REQUIRED_BASELINE_PACKAGES.map((pkg) => {
                          const isInstalled =
                            log.packages_installed.includes(pkg) || log.packages_skipped.includes(pkg);
                          const isFailed = log.packages_failed.some((f) => f.id === pkg);

                          return (
                            <td key={pkg} className="p-3.5 text-center">
                              {isFailed ? (
                                <span className="px-2 py-1 rounded bg-red-200 text-red-900 font-bold border border-red-800 text-[10px]">
                                  [✖ Fail]
                                </span>
                              ) : isInstalled ? (
                                <span className="px-2 py-1 rounded bg-[#88FF44] text-[#002B2B] font-bold border border-[#002B2B] text-[10px]">
                                  [✔ Parity]
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 font-bold border border-amber-700 text-[10px]">
                                  [⚠ Drift]
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="px-3 py-1 rounded-lg bg-[#88FF44] text-[#002B2B] font-bold border border-[#002B2B] hover:bg-[#77EE33] transition-colors"
                          >
                            Inspect &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs font-mono">
              <div className="text-[#002B2B]/70 font-bold">
                Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
              </div>

              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#002B2B] font-bold border border-[#002B2B] hover:bg-[#88FF44] disabled:opacity-40 transition-colors"
                >
                  &larr; Prev
                </button>
                <span className="font-bold text-[#002B2B] px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#002B2B] font-bold border border-[#002B2B] hover:bg-[#88FF44] disabled:opacity-40 transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Slide-over Detail Inspection Modal Portal (Mounted to document.body) */}
      {mounted && selectedLog && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white border-l-4 border-[#002B2B] h-full flex flex-col p-6 space-y-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-[#002B2B] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#002B2B]">[Telemetry Details]</h2>
                <p className="text-xs font-mono text-[#002B2B]/70 mt-1 select-all">{selectedLog.machine_hash}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1.5 rounded-xl bg-[#002B2B] text-[#88FF44] font-mono text-xs font-bold border border-[#002B2B] hover:bg-[#002B2B]/90"
              >
                ✕ Esc
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-[#F8F7F3] border-2 border-[#002B2B]">
                <div className="text-[10px] font-mono uppercase text-[#002B2B]/60 font-bold">Installed</div>
                <div className="text-xl font-black text-[#002B2B]">{selectedLog.packages_installed.length}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F7F3] border-2 border-[#002B2B]">
                <div className="text-[10px] font-mono uppercase text-[#002B2B]/60 font-bold">Skipped</div>
                <div className="text-xl font-black text-[#002B2B]">{selectedLog.packages_skipped.length}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F7F3] border-2 border-[#002B2B]">
                <div className="text-[10px] font-mono uppercase text-[#002B2B]/60 font-bold">Failed</div>
                <div className="text-xl font-black text-red-600">{selectedLog.packages_failed.length}</div>
              </div>
            </div>

            {selectedLog.packages_failed.length > 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-600 text-xs font-mono space-y-2">
                <div className="font-bold text-red-700 uppercase">[Failed Packages & Error Reasons]</div>
                {selectedLog.packages_failed.map((f) => (
                  <div key={f.id} className="text-red-800 bg-white p-2 rounded border border-red-400">
                    <span className="font-bold">{f.id}:</span> {f.reason}
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#002B2B] font-mono">[JSON Telemetry Payload]</span>
                <button
                  onClick={() => copyTelemetryLog(selectedLog)}
                  className="px-3 py-1 text-xs font-mono font-bold rounded-xl bg-[#88FF44] text-[#002B2B] border-2 border-[#002B2B] shadow-[2px_2px_0px_#002B2B]"
                >
                  {copied ? '✔ Copied!' : 'Copy Telemetry JSON'}
                </button>
              </div>

              <pre className="flex-1 p-4 rounded-xl bg-[#002B2B] text-[#88FF44] text-xs font-mono overflow-x-auto select-all leading-relaxed border-2 border-[#002B2B]">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
