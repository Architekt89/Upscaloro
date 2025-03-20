'use client';

import { useEffect, useState, useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, session } = useAuth();
  const [userSubscription, setUserSubscription] = useState<"free" | "pro" | "enterprise">("free");
  const [imagesProcessedThisMonth, setImagesProcessedThisMonth] = useState(0);
  const [maxImagesPerMonth, setMaxImagesPerMonth] = useState(3);
  const [loading, setLoading] = useState(false);
  const dataFetchedRef = useRef(false);

  // Prefetch user subscription data as soon as possible
  useEffect(() => {
    // Only run once and skip if no user
    if (dataFetchedRef.current || !user) return;
    dataFetchedRef.current = true;

    const fetchUserData = async () => {
      try {
        // Skip showing loading indicator for faster perceived performance
        setLoading(false);
        
        // Optimized data fetching approach
        // Step 1: Check user metadata (fastest method)
        if (user?.user_metadata?.subscription_tier) {
          const plan = user.user_metadata.subscription_tier.toLowerCase();
          setUserSubscription(plan as "free" | "pro" | "enterprise");
          
          // Set limits based on plan
          if (plan === 'pro') {
            setMaxImagesPerMonth(400);
          } else if (plan === 'enterprise') {
            setMaxImagesPerMonth(1000);
          } else {
            setMaxImagesPerMonth(3);
          }
          return;
        }
        
        // Step 2: Directly query Supabase users table
        if (user?.id) {
          // Use dynamic import to reduce initial bundle size
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          );
          
          // Query with minimal fields for faster response
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('subscription_tier, images_processed_this_month')
            .eq('id', user.id)
            .single();
          
          if (!userError && userData) {
            const plan = userData.subscription_tier?.toLowerCase() || 'free';
            setUserSubscription(plan as "free" | "pro" | "enterprise");
            setImagesProcessedThisMonth(userData.images_processed_this_month || 0);
            
            if (plan === 'pro') {
              setMaxImagesPerMonth(400);
            } else if (plan === 'enterprise') {
              setMaxImagesPerMonth(1000);
            } else {
              setMaxImagesPerMonth(5);
            }
            return;
          }
        }
          
        // Fallback to default values
        setUserSubscription("free");
        setImagesProcessedThisMonth(0);
        setMaxImagesPerMonth(3);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Silent error handling for better UX - only show error if critical
        // toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    // Start fetching immediately
    fetchUserData();
  }, [user]);

  // Render immediately with default values
  return (
    <div className="mx-auto px-0">
      <ImageUploader
        userSubscription={userSubscription}
        imagesProcessedThisMonth={imagesProcessedThisMonth}
        maxImagesPerMonth={maxImagesPerMonth}
        isLoading={loading}
      />
    </div>
  );
} 