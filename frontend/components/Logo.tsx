import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  linkWrapper?: boolean;
}

export default function Logo({ className = '', width = 80, height = 80, linkWrapper = false }: LogoProps) {
  const logoContent = (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image 
        src="/Images/logo.png" 
        alt="picluxe Logo" 
        fill
        className="object-contain"
        priority
      />
    </div>
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