import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IDEE-CLI — Idempotent Dev Environment Engine',
  description:
    'Windows-native developer environment reconciliation engine. Declare your baseline, run one command, achieve 100% machine parity across your entire engineering org.',
  openGraph: {
    title: 'IDEE-CLI — Idempotent Dev Environment Engine',
    description: 'Your next insight... [one command away]. Declarative developer environment parity.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8F7F3] text-[#002B2B] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
