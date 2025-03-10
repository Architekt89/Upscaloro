'use client';

import { useEffect, useState } from 'react';

export default function TabTitleManager() {
  const originalTitle = 'picluxe – Bring Your Images to Life in Stunning Detail';
  const alternatingTitles = [
    'Perfect Your Images ✨',
    'Upscale Instantly ⏳'
  ];
  
  const [isTabActive, setIsTabActive] = useState(true);
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    // Handle visibility change
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
      
      // Reset title when tab becomes visible again
      if (!document.hidden) {
        document.title = originalTitle;
      }
    };

    // Set up interval for blinking title when tab is not active
    let titleInterval: NodeJS.Timeout | null = null;
    
    if (!isTabActive) {
      titleInterval = setInterval(() => {
        setTitleIndex(prevIndex => (prevIndex + 1) % alternatingTitles.length);
        document.title = alternatingTitles[titleIndex];
      }, 1500); // Change every 1.5 seconds
    } else {
      document.title = originalTitle;
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (titleInterval) clearInterval(titleInterval);
    };
  }, [isTabActive, titleIndex, originalTitle, alternatingTitles]);

  // This component doesn't render anything visible
  return null;
} 