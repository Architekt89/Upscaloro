import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 80, height = 80 }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 80 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-auto"
      >
        {/* Main circle */}
        <circle cx="40" cy="40" r="40" fill="#F97316" />
        
        {/* Inner white circle */}
        <circle cx="40" cy="40" r="32" fill="white" />
        
        {/* Letter P stylized */}
        <path 
          d="M28 24H44C48.4183 24 52 27.5817 52 32C52 36.4183 48.4183 40 44 40H28V24Z" 
          fill="#F97316" 
        />
        <path 
          d="M28 40V56H36V40H44" 
          stroke="#F97316" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Upward arrow */}
        <path 
          d="M56 36L64 28M64 28L56 20M64 28H48" 
          stroke="#F97316" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </Link>
  );
} 