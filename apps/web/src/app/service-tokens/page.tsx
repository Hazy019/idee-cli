'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';

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
    <div className="min-h-screen bg-[#F8F7F3] text-[#002B2B] flex flex-col font-sans selection:bg-[#88FF44] selection:text-[#002B2B]">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* Header & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#002B2B] pb-6 gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-[#002B2B]/60 uppercase tracking-widest">[SECURITY MANAGEMENT]</div>
            <h1 className="text-3xl font-extrabold text-[#002B2B] tracking-tight mt-1">
              [CI Service Tokens]
            </h1>
            <p className="text-xs text-[#002B2B]/70 mt-1">
              Organization-scoped tokens for CI runners (`IDEE_SERVICE_TOKEN`). Service tokens expire after 90 days.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-[#002B2B] font-mono text-xs font-bold border-2 border-[#002B2B] hover:bg-[#88FF44] transition-colors stacked-card-shadow"
          >
            &larr; [Back to Dashboard]
          </Link>
        </div>

        {issuedToken && (
          <div className="p-5 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-3">
            <div className="font-extrabold text-sm text-[#002B2B] font-mono">[NEW TOKEN GENERATED SUCCESSFULLY]</div>
            <div className="font-mono bg-[#002B2B] text-[#88FF44] p-4 rounded-xl text-xs select-all border-2 border-[#002B2B]">
              {issuedToken}
            </div>
            <div className="text-xs font-mono text-[#002B2B]/70">
              Copy and store this token immediately in your CI pipeline secrets (`IDEE_SERVICE_TOKEN`).
            </div>
          </div>
        )}

        {/* Create Token Form */}
        <div className="p-6 rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow space-y-4">
          <h2 className="text-sm font-mono font-bold text-[#002B2B] uppercase tracking-wider">[Generate New Service Token]</h2>
          <form onSubmit={createToken} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Service Account Name (e.g. GitHub Actions CI Main)"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2.5 text-xs bg-[#F8F7F3] border border-[#002B2B]/20 rounded-xl text-[#002B2B] focus:outline-none focus:border-[#002B2B]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono font-bold rounded-xl bg-[#88FF44] hover:bg-[#77EE33] text-[#002B2B] border-2 border-[#002B2B] shadow-[2px_2px_0px_#002B2B] transition-all"
            >
              [Generate Token]
            </button>
          </form>
        </div>

        {/* Service Tokens Table */}
        <div className="rounded-2xl bg-white border-2 border-[#002B2B] stacked-card-shadow overflow-hidden">
          <div className="p-4 border-b-2 border-[#002B2B] bg-[#002B2B] text-white flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-[#88FF44]">[ACTIVE ORGANIZATION SERVICE TOKENS]</span>
            <span>Total: {tokens.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F8F7F3] text-[#002B2B]/70 uppercase tracking-wider border-b-2 border-[#002B2B]">
                <tr>
                  <th className="p-4">Service Account Name</th>
                  <th className="p-4">Token Preview</th>
                  <th className="p-4">Expires On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#002B2B]/10">
                {tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-[#F8F7F3] transition-colors">
                    <td className="p-4 font-bold text-[#002B2B]">{token.name}</td>
                    <td className="p-4 text-[#002B2B]/70">{token.token_hash}</td>
                    <td className="p-4 text-[#002B2B]/70">
                      {new Date(token.expires_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {token.status === 'expired' && (
                        <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 font-bold border border-red-500/30">
                          EXPIRED
                        </span>
                      )}
                      {token.status === 'warning' && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 font-bold border border-amber-500/30">
                          EXPIRES IN {token.daysUntilExpiry} DAYS
                        </span>
                      )}
                      {token.status === 'active' && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#88FF44] text-[#002B2B] font-bold border border-[#002B2B]">
                          ACTIVE ({token.daysUntilExpiry} days left)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {confirmingId === token.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-[11px] text-red-600 font-bold">Confirm?</span>
                          <button
                            onClick={() => handleRevokeRegenerate(token.id, token.name)}
                            className="px-3 py-1 text-[11px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-700"
                          >
                            Revoke
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-200 text-[#002B2B]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(token.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-red-500/10 text-red-700 border border-[#002B2B] transition-colors"
                        >
                          Revoke &amp; Regenerate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#002B2B] py-6 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[#002B2B]/70 font-mono">
          <div>IDEE-CLI &bull; Service Account Token Management</div>
          <Link href="/dashboard" className="hover:underline font-bold">[Back to Parity Grid]</Link>
        </div>
      </footer>
    </div>
  );
}
