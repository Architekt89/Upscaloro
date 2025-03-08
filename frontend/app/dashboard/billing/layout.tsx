'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        {children}
      </div>
    </ProtectedRoute>
  );
} 