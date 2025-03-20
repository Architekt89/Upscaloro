'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Header />
        <main className="pb-0" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.5rem' }}>{children}</main>
      </div>
    </ProtectedRoute>
  );
} 