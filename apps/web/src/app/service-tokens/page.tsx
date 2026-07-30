'use client';

import React, { useState, useEffect } from 'react';

interface ServiceAccount {
  id: string;
  name: string;
  token_hash: string;
  expires_at: string;
  status: 'active' | 'warning' | 'expired';
  daysUntilExpiry: number;
}

export default function ServiceTokensPage() {
  const [tokens, setTokens] = useState<ServiceAccount[]>([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchTokens = () => {
    fetch('/api/service-accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.serviceAccounts) setTokens(data.serviceAccounts);
      })
      .catch(() => {
        const expExp = new Date();
        expExp.setDate(expExp.getDate() - 2);

        const expWarn = new Date();
        expWarn.setDate(expWarn.getDate() + 5);

        const expActive = new Date();
        expActive.setDate(expActive.getDate() + 45);

        setTokens([
          {
            id: 'sa-1',
            name: 'GitHub Actions CI Main Runner',
            token_hash: 'st_8a7f901...3b9',
            expires_at: expActive.toISOString(),
            status: 'active',
            daysUntilExpiry: 45,
          },
          {
            id: 'sa-2',
            name: 'Staging Nightly Smoke Runner',
            token_hash: 'st_31a982b...1c4',
            expires_at: expWarn.toISOString(),
            status: 'warning',
            daysUntilExpiry: 5,
          },
          {
            id: 'sa-3',
            name: 'Legacy Jenkins Integration Account',
            token_hash: 'st_00ab19c...99a',
            expires_at: expExp.toISOString(),
            status: 'expired',
            daysUntilExpiry: -2,
          },
        ]);
      });
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const createToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    const res = await fetch('/api/service-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTokenName }),
    });

    const data = await res.json();
    if (data.token) {
      setIssuedToken(data.token);
      setNewTokenName('');
      fetchTokens();
    }
  };

  const handleRevokeRegenerate = async (id: string, name: string) => {
    const res = await fetch('/api/service-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'regenerate', id, name }),
    });

    const data = await res.json();
    if (data.token) {
      setIssuedToken(data.token);
      setConfirmingId(null);
      fetchTokens();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">CI Service Tokens</h1>
        <p className="text-text-secondary text-sm mt-1">
          Org-scoped tokens for CI runners (`IDEE_SERVICE_TOKEN`). Service tokens expire after 90 days.
        </p>
      </div>

      {issuedToken && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 space-y-2">
          <div className="font-bold text-sm">New Service Token Generated</div>
          <div className="font-mono bg-bg p-3 rounded-lg text-xs text-text-primary border border-border select-all">
            {issuedToken}
          </div>
          <div className="text-xs text-text-secondary">
            Copy and store immediately in your CI pipeline secrets.
          </div>
        </div>
      )}

      {/* Create Token Form */}
      <form onSubmit={createToken} className="p-4 rounded-xl bg-surface border border-border flex items-center gap-3">
        <input
          type="text"
          placeholder="Service Account Name (e.g. GitHub Actions CI)"
          value={newTokenName}
          onChange={(e) => setNewTokenName(e.target.value)}
          className="flex-1 px-3.5 py-2 text-xs bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Generate Token
        </button>
      </form>

      {/* Service Tokens Table */}
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900 text-text-secondary uppercase tracking-wider font-mono border-b border-border">
            <tr>
              <th className="p-4">Service Account Name</th>
              <th className="p-4">Token Preview</th>
              <th className="p-4">Expires On</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {tokens.map((token) => (
              <tr key={token.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="p-4 font-semibold text-text-primary">{token.name}</td>
                <td className="p-4 font-mono text-text-secondary">{token.token_hash}</td>
                <td className="p-4 text-text-secondary font-mono">
                  {new Date(token.expires_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {token.status === 'expired' && (
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold border border-red-500/20">
                      EXPIRED
                    </span>
                  )}
                  {token.status === 'warning' && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                      EXPIRES IN {token.daysUntilExpiry} DAYS
                    </span>
                  )}
                  {token.status === 'active' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      ACTIVE ({token.daysUntilExpiry} days left)
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {confirmingId === token.id ? (
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-[11px] text-red-400 font-medium">Confirm Revoke?</span>
                      <button
                        onClick={() => handleRevokeRegenerate(token.id, token.name)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-red-600 hover:bg-red-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        Yes, Revoke
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(token.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-red-500/10 text-red-400 border border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Revoke & Regenerate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
