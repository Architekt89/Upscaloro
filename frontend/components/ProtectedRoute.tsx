'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect once, and only if auth check is complete and no user
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/auth/login');
    }
  }, [user, loading, router, isRedirecting]);

  // Immediately render children to improve perceived performance
  // No loading overlay to avoid layout shifts
  return <>{children}</>;
} 