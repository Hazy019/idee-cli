import React from 'react';
import { LightbulbLogo } from '@/components/LightbulbLogo';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center p-6 dot-grid-light">
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <LightbulbLogo size="lg" className="animate-pulse" />
        <div className="font-mono text-xs font-bold text-[#002B2B] tracking-widest uppercase">
          [Synchronizing Environment State...]
        </div>
      </div>
    </div>
  );
}
