'use client';

import React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
      <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mx-auto flex items-center justify-center font-bold text-lg">
        !
      </div>
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Unable to Load Telemetry Data</h2>
        <p className="text-xs text-zinc-400 mt-1">
          A server error occurred while retrieving environment state. Please retry your request.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        Retry Connection
      </button>
    </div>
  );
}
