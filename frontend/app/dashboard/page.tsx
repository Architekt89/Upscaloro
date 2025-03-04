'use client';

import { useEffect, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [userSubscription, setUserSubscription] = useState<"free" | "pro">("free");
  const [imagesProcessedThisMonth, setImagesProcessedThisMonth] = useState(0);
  const [maxImagesPerMonth, setMaxImagesPerMonth] = useState(3);
  const [loading, setLoading] = useState(true);

  // Fetch user subscription data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you would fetch this from your API
        // For now, we'll use mock data
        setUserSubscription("free");
        setImagesProcessedThisMonth(1);
        setMaxImagesPerMonth(3);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">
            <span className={userSubscription === 'pro' ? 'text-orange-400' : 'text-gray-400'}>
              {userSubscription === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </span> • {imagesProcessedThisMonth} / {maxImagesPerMonth} images
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-full text-white bg-transparent hover:bg-gray-800 transition-all duration-300"
        >
          Logout
        </button>
      </div>
      
      <ImageUploader
        userSubscription={userSubscription}
        imagesProcessedThisMonth={imagesProcessedThisMonth}
        maxImagesPerMonth={maxImagesPerMonth}
      />
    </div>
  );
} 