'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
}

export default function TypewriterText({ 
  text, 
  className = '', 
  typingSpeed = 50 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isTyping) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, displayedText.length + 1));
      }, typingSpeed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [displayedText, text, typingSpeed, isTyping]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
} 