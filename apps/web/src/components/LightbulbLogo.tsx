import React from 'react';

export function LightbulbLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Lightbulb graphic with radiating rays */}
      <svg
        className={`${sizeClasses[size]} text-[#002B2B] overflow-visible`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radiating Lime Green Rays */}
        <g stroke="#88FF44" strokeWidth="3.5" strokeLinecap="round">
          <line x1="50" y1="5" x2="50" y2="15" />
          <line x1="22" y1="18" x2="28" y2="25" />
          <line x1="78" y1="18" x2="72" y2="25" />
          <line x1="10" y1="46" x2="19" y2="46" />
          <line x1="90" y1="46" x2="81" y2="46" />
          <line x1="20" y1="74" x2="27" y2="68" />
          <line x1="80" y1="74" x2="73" y2="68" />
        </g>

        {/* Bulb Glass Outer Shell */}
        <path
          d="M50 22 C34 22 24 34 24 48 C24 58 32 66 38 72 L38 78 C38 81 40 83 43 83 L57 83 C60 83 62 81 62 78 L62 72 C68 66 76 58 76 48 C76 34 66 22 50 22 Z"
          fill="#FFFFFF"
          stroke="#002B2B"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Bulb Interior Lime Filament */}
        <path
          d="M42 54 C42 44 58 44 58 54 M45 44 L45 60 M55 44 L55 60"
          stroke="#88FF44"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Screw Base */}
        <path
          d="M40 83 L60 83 M42 88 L58 88 M46 93 L54 93"
          stroke="#002B2B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
