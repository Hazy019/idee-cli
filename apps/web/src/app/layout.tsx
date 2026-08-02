import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IDEE-CLI',
  description:
    'Windows-native developer environment reconciliation engine architected by Kyrell Santillan and Hazy. Declare your baseline, run one command, achieve 100% machine parity across your entire engineering org.',
  authors: [
    { name: 'Kyrell Santillan', url: 'https://hazy.cosedevs.com/' },
    { name: 'Hazy', url: 'https://github.com/Hazy019' },
  ],
  creator: 'Kyrell Santillan & Hazy',
  publisher: 'IDEE-CLI Architecture Team',
  keywords: [
    'IDEE-CLI',
    'Kyrell Santillan',
    'Hazy',
    'Windows Dev Environment Engine',
    'Idempotent Reconciliation',
    'Package Parity',
    'Winget Package Engine',
    'Developer Environment Automation',
    'Kahn DAG Dependency Engine',
    'Telemetry Parity Grid',
  ],
  icons: {
    icon: '/Logo.png',
    shortcut: '/Logo.png',
    apple: '/Logo.png',
  },
  openGraph: {
    title: 'IDEE-CLI — Idempotent Dev Environment Engine | Kyrell Santillan & Hazy',
    description:
      'Windows-native developer environment reconciliation engine. Designed and architected by Kyrell Santillan and Hazy.',
    type: 'website',
    siteName: 'IDEE-CLI',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IDEE-CLI — Idempotent Dev Environment Engine | Kyrell Santillan & Hazy',
    description:
      'Declarative Windows dev environment parity engine by Kyrell Santillan & Hazy.',
    creator: '@KyrellSantillan',
  },
  other: {
    'geo.region': 'US',
    'geo.placename': 'Global Developer Environment Engine',
    'author-credits': 'Kyrell Santillan, Hazy',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'IDEE-CLI',
    operatingSystem: 'Windows 10, Windows 11',
    applicationCategory: 'DeveloperApplication',
    description:
      'Windows-native developer environment reconciliation engine. Declare your baseline, run one command, achieve 100% machine parity across your entire engineering org.',
    author: [
      {
        '@type': 'Person',
        name: 'Kyrell Santillan',
      },
      {
        '@type': 'Person',
        name: 'Hazy',
      },
    ],
    creator: {
      '@type': 'Organization',
      name: 'IDEE-CLI Engineering Core',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="bg-[#F8F7F3] text-[#002B2B] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
