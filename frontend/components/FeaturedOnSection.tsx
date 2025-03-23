'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Utility function for joining classnames
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const FeaturedOnSection = () => {
  const logos = [
    { name: 'Medium', url: '/vectorizer/Medium.svg' },
    { name: 'YouTube', url: '/vectorizer/YouTube.svg' },
    { name: 'Reddit', url: '/vectorizer/Reddit.svg' },
    { name: 'GitHub', url: '/vectorizer/GitHub.svg' },
    // Duplicate logos to ensure smooth scrolling
    { name: 'Medium-2', url: '/vectorizer/Medium.svg' },
    { name: 'YouTube-2', url: '/vectorizer/YouTube.svg' },
    { name: 'Reddit-2', url: '/vectorizer/Reddit.svg' },
    { name: 'GitHub-2', url: '/vectorizer/GitHub.svg' },
  ];

  // Modified version of InfiniteMovingCards for logos
  const LogoMarquee = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLUListElement>(null);
    const [start, setStart] = useState(false);

    useEffect(() => {
      if (containerRef.current && scrollerRef.current) {
        const scrollerContent = Array.from(scrollerRef.current.children);

        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          if (scrollerRef.current) {
            scrollerRef.current.appendChild(duplicatedItem);
          }
        });

        // Set animation direction and speed
        containerRef.current.style.setProperty("--animation-duration", "40s");
        containerRef.current.style.setProperty("--animation-direction", "forwards");
        setStart(true);
      }
    }, []);

    return (
      <div
        ref={containerRef}
        className="scroller relative z-20 max-w-7xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
      >
        <ul
          ref={scrollerRef}
          className={cn(
            "flex w-max min-w-full shrink-0 flex-nowrap gap-24 py-8",
            start ? "animate-scroll" : "",
            "hover:[animation-play-state:paused]",
          )}
        >
          {logos.map((logo, idx) => (
            <li
              key={idx}
              className="relative w-36 max-w-full flex-shrink-0 flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-300 group"
            >
              <div className="h-12 w-36 relative flex items-center justify-center p-4 rounded-md group-hover:bg-black/20 transition-colors duration-300">
                <Image 
                  src={logo.url} 
                  alt={logo.name.replace(/-\d+$/, '')} 
                  width={144} 
                  height={48} 
                  className="object-contain filter invert hue-rotate-180 group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h3 className="text-gray-400 uppercase text-sm font-medium tracking-wider">Featured On</h3>
      </div>
      <LogoMarquee />
    </div>
  );
};

export default FeaturedOnSection; 