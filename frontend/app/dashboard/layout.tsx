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
        <main className="pb-12 pt-24">{children}</main>
      </div>
    </ProtectedRoute>
  );
} 