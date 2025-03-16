'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SubscriptionData {
  has_subscription: boolean;
  subscription_tier: string;
  subscription_status: string | null;
  current_period_end: string | null;
}

export default function SubscriptionInfo() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://upscaloro.onrender.com/subscription/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch subscription data: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.status === 'success') {
          setSubscriptionData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch subscription data');
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [user?.id, user?.token]);
  
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-500';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
      case 'past_due':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getPlanLabel = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro':
        return 'Pro Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      case 'free':
      default:
        return 'Free Plan';
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Your current subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        {!subscriptionData?.has_subscription ? (
          <div>
            <p className="text-lg font-medium">You are currently on the Free Plan</p>
            <p className="text-muted-foreground mt-2">
              Upgrade to Pro for more features and higher resolution upscaling.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/pricing'}>
              Upgrade Now
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-lg font-medium">{getPlanLabel(subscriptionData.subscription_tier)}</p>
              </div>
              <Badge className={getStatusColor(subscriptionData.subscription_status)}>
                {subscriptionData.subscription_status || 'Unknown'}
              </Badge>
            </div>
            
            {subscriptionData.current_period_end && (
              <div>
                <p className="text-sm text-muted-foreground">Renewal Date</p>
                <p className="text-base">
                  {formatDate(new Date(subscriptionData.current_period_end))}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
                Change Plan
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/account'}>
                Manage Billing
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 