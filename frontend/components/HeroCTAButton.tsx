'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeroCTAButton() {
  const { user } = useAuth();
  
  return (
    <>
      <Link
        href={user ? "/dashboard" : "/auth/signup"}
        className="inline-block px-10 py-5 text-lg font-semibold text-white 
          bg-gradient-to-r from-orange-500 to-orange-600 
          rounded-full 
          shadow-[0_0_40px_-5px_rgba(249,115,22,0.5)] 
          hover:shadow-[0_0_60px_-5px_rgba(249,115,22,0.7)] 
          hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600 
          transition-all duration-300 ease-out hover:scale-105 
          animate-pulse-subtle 
          border border-orange-500/20
          backdrop-blur-sm
          relative
          before:content-[''] before:absolute before:inset-0 before:bg-white/10 before:rounded-full before:opacity-0 before:hover:opacity-20 before:transition-opacity"
      >
        {user ? 'Go to Dashboard' : 'Get Started For Free'}
      </Link>
      
      {!user && (
        <p className="mt-4 text-gray-400 text-sm font-medium">
          No credit card required
        </p>
      )}
    </>
  );
} 