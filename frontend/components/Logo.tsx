import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  linkWrapper?: boolean;
}

export default function Logo({ className = '', width = 80, height = 80, linkWrapper = false }: LogoProps) {
  const logoContent = (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 80 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="80" height="80" rx="16" fill="url(#paint0_linear_1_2)" />
      <path d="M24 52H56V56H24V52Z" fill="white" />
      <path d="M32 24H48V48H32V24Z" fill="white" />
      <path d="M24 32H32V40H24V32Z" fill="white" />
      <path d="M48 32H56V40H48V32Z" fill="white" />
      <defs>
        <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5E3A" />
          <stop offset="1" stopColor="#FF9500" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (linkWrapper) {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
} 