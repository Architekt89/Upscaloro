'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950">
        <main className="pb-12 pt-24">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 