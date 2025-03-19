import React, { useEffect, useState } from 'react';
import { ArrowUp as ArrowUpIcon, Scale as ScaleIcon, Image as ImageIcon, Clock as ClockIcon } from 'lucide-react';
import { PieChart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface UsageStatsProps {
  userId: string;
  token: string;
}

interface UsageData {
  subscription: {
    tier: string;
    name: string;
  };
  limits: {
    daily: number | null;
    monthly: number | null;
    max_resolution: string;
    max_scale_factor: number;
    allowed_modes: string[];
  };
  usage: {
    today: number;
    this_month: number;
    remaining_daily: number | null;
    remaining_monthly: number | null;
    percentage_used_daily: number | null;
    percentage_used_monthly: number | null;
  };
}

export default function UsageStats({ userId, token }: UsageStatsProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const response = await axios.get(`${apiUrl}/user/usage`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUsageData(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching usage data:', err);
        setError('Failed to load usage data');
        toast.error('Could not load your usage statistics');
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUsageData();
    }
  }, [userId, token]);

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-800/30 backdrop-blur-sm p-6 shadow-md border border-gray-700/30">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-gray-700"></div>
          <div className="h-24 rounded bg-gray-700"></div>
          <div className="h-4 w-1/2 rounded bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className="rounded-lg bg-gray-800/30 backdrop-blur-sm p-6 shadow-md border border-gray-700/30">
        <p className="text-red-400">Could not load usage statistics. Please try again later.</p>
      </div>
    );
  }

  // Free tier - show daily limits
  if (usageData.subscription.tier === 'free') {
    return (
      <div className="rounded-lg bg-gray-800/30 backdrop-blur-sm p-6 shadow-md border border-gray-700/30">
        <h3 className="mb-4 text-lg font-semibold text-white">Free Plan Usage</h3>
        
        {/* Daily usage */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <ImageIcon className="mr-2 h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-300">Images Today</span>
            </div>
            <span className="text-sm font-bold text-white">{usageData.usage.today} / {usageData.limits.daily}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div 
              className="h-2 rounded-full bg-orange-500" 
              style={{ width: `${Math.min(100, usageData.usage.percentage_used_daily || 0)}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {usageData.usage.remaining_daily === 0 
              ? "You've reached your daily limit. Images will reset tomorrow." 
              : `${usageData.usage.remaining_daily} images remaining today`}
          </p>
        </div>
        
        {/* Resolution limit */}
        <div className="mb-4 flex items-center">
          <ScaleIcon className="mr-2 h-5 w-5 text-orange-500" />
          <span className="text-sm text-gray-300">Max resolution: <span className="font-medium text-white">{usageData.limits.max_resolution}</span></span>
        </div>
        
        {/* Scale limit */}
        <div className="mb-4 flex items-center">
          <ArrowUpIcon className="mr-2 h-5 w-5 text-orange-500" />
          <span className="text-sm text-gray-300">Max scale factor: <span className="font-medium text-white">{usageData.limits.max_scale_factor}x</span></span>
        </div>
        
        <div className="mt-4 rounded-md bg-gray-700/30 p-3">
          <p className="text-xs text-gray-400">
            Free plan includes {usageData.limits.daily} images per day with {usageData.limits.max_resolution} resolution. 
            <a href="/pricing" className="ml-1 font-medium text-orange-500 hover:text-orange-600">Upgrade for more</a>
          </p>
        </div>
      </div>
    );
  }

  // Pro tier - show monthly limits
  if (usageData.subscription.tier === 'pro') {
    return (
      <div className="rounded-lg bg-gray-800/30 backdrop-blur-sm p-6 shadow-md border border-gray-700/30">
        <div className="mb-2 flex items-center">
          <h3 className="text-lg font-semibold text-white">Pro Plan Usage</h3>
          <span className="ml-2 rounded-full bg-orange-900/30 px-2.5 py-0.5 text-xs font-medium text-orange-300">
            Pro
          </span>
        </div>
        
        {/* Monthly usage */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-300">Monthly Usage</span>
            </div>
            <span className="text-sm font-bold text-white">{usageData.usage.this_month} / {usageData.limits.monthly}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div 
              className="h-2 rounded-full bg-orange-500" 
              style={{ width: `${Math.min(100, usageData.usage.percentage_used_monthly || 0)}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {usageData.usage.remaining_monthly === 0 
              ? "You've reached your monthly limit. Upgrade to Enterprise for unlimited images." 
              : `${usageData.usage.remaining_monthly} images remaining this month`}
          </p>
        </div>
        
        {/* Resolution limit */}
        <div className="mb-4 flex items-center">
          <ScaleIcon className="mr-2 h-5 w-5 text-orange-500" />
          <span className="text-sm text-gray-300">Max resolution: <span className="font-medium text-white">{usageData.limits.max_resolution}</span></span>
        </div>
        
        {/* Scale limit */}
        <div className="mb-4 flex items-center">
          <ArrowUpIcon className="mr-2 h-5 w-5 text-orange-500" />
          <span className="text-sm text-gray-300">Max scale factor: <span className="font-medium text-white">{usageData.limits.max_scale_factor}x</span></span>
        </div>
        
        <div className="mt-4 rounded-md bg-gray-700/30 p-3">
          <p className="text-xs text-gray-400">
            Pro plan includes {usageData.limits.monthly} images per month with {usageData.limits.max_resolution} resolution.
            <a href="/pricing" className="ml-1 font-medium text-orange-500 hover:text-orange-600">
              Need more? Upgrade to Enterprise
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Enterprise tier - show unlimited features
  return (
    <div className="rounded-lg bg-gray-800/30 backdrop-blur-sm p-6 shadow-md border border-gray-700/30">
      <div className="mb-4 flex items-center">
        <h3 className="text-lg font-semibold text-white">Enterprise Plan</h3>
        <span className="ml-2 rounded-full bg-purple-900/30 px-2.5 py-0.5 text-xs font-medium text-purple-300">
          Enterprise
        </span>
      </div>
      
      <div className="mb-4 flex items-center">
        <ImageIcon className="mr-2 h-5 w-5 text-orange-500" />
        <span className="text-sm text-gray-300">Images processed this month: <span className="font-medium text-white">{usageData.usage.this_month}</span></span>
      </div>
      
      <div className="mb-4 flex items-center">
        <ScaleIcon className="mr-2 h-5 w-5 text-orange-500" />
        <span className="text-sm text-gray-300">Max resolution: <span className="font-medium text-white">{usageData.limits.max_resolution}</span></span>
      </div>
      
      <div className="mb-4 flex items-center">
        <ArrowUpIcon className="mr-2 h-5 w-5 text-orange-500" />
        <span className="text-sm text-gray-300">Max scale factor: <span className="font-medium text-white">{usageData.limits.max_scale_factor}x</span></span>
      </div>
      
      <div className="mb-1 mt-6 rounded-md bg-purple-900/30 p-3">
        <p className="text-xs text-gray-400">
          Enterprise plan includes unlimited image processing, {usageData.limits.max_resolution} max resolution,
          and access to all upscaling modes. Thank you for your support!
        </p>
      </div>
    </div>
  );
} 