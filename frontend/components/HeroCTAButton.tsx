'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/moving-border';

export default function HeroCTAButton() {
  const { user } = useAuth();
  
  return (
    <>
      <Button
        as={Link}
        href={user ? "/dashboard" : "/auth/signup"}
        className="px-10 py-5 text-lg font-semibold text-white hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600 transition-all duration-300 ease-out hover:scale-105"
        containerClassName="rounded-full shadow-[0_0_40px_-5px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-5px_rgba(249,115,22,0.7)]"
        borderClassName="bg-[radial-gradient(#ffffff_10%,rgba(255,255,255,0.7)_25%,transparent_60%)] opacity-70"
        duration={2500}
      >
        {user ? 'Go to Dashboard' : 'Get Started For Free'}
      </Button>
      
      {!user && (
        <p className="mt-4 text-gray-400 text-sm font-medium">
          No credit card required
        </p>
      )}
    </>
  );
} 