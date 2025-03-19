'use client';

import { useEffect, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, session } = useAuth();
  const [userSubscription, setUserSubscription] = useState<"free" | "pro" | "enterprise">("free");
  const [imagesProcessedThisMonth, setImagesProcessedThisMonth] = useState(0);
  const [maxImagesPerMonth, setMaxImagesPerMonth] = useState(3);
  const [loading, setLoading] = useState(true);

  // Fetch user subscription data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Step 1: Check user metadata first (fastest if available)
        if (user?.user_metadata?.subscription_tier) {
          const plan = user.user_metadata.subscription_tier.toLowerCase();
          console.log('Found subscription tier in user metadata:', plan);
          setUserSubscription(plan as "free" | "pro" | "enterprise");
          
          // Set limits based on plan
          if (plan === 'pro') {
            setMaxImagesPerMonth(100);
          } else if (plan === 'enterprise') {
            setMaxImagesPerMonth(1000);
          } else {
            setMaxImagesPerMonth(3);
          }
          
          setLoading(false);
          return;
        }
        
        // Step 2: Directly query Supabase users table
        if (user?.id) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          );
          
          console.log('Fetching subscription data from users table for user ID:', user.id);
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('subscription_tier, images_processed_this_month')
            .eq('id', user.id)
            .single();
          
          if (!userError && userData) {
            console.log('Found subscription data in users table:', userData);
            const plan = userData.subscription_tier?.toLowerCase() || 'free';
            setUserSubscription(plan as "free" | "pro" | "enterprise");
            
            // Set images processed
            setImagesProcessedThisMonth(userData.images_processed_this_month || 0);
            
            // Set limits based on plan
            if (plan === 'pro') {
              setMaxImagesPerMonth(100);
            } else if (plan === 'enterprise') {
              setMaxImagesPerMonth(1000);
            } else {
              setMaxImagesPerMonth(3);
            }
            
            setLoading(false);
            return;
          }
        }
          
        // Fallback to default values
        setUserSubscription("free");
        setImagesProcessedThisMonth(1);
        setMaxImagesPerMonth(3);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
        // Use default values on error
        setUserSubscription("free");
        setImagesProcessedThisMonth(0);
        setMaxImagesPerMonth(3);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
      <ImageUploader
        userSubscription={userSubscription as "free" | "pro" | "enterprise"}
        imagesProcessedThisMonth={imagesProcessedThisMonth}
        maxImagesPerMonth={maxImagesPerMonth}
      />
    </div>
  );
} 