'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Throttled scroll handler for better performance
  const toggleVisibility = useCallback(() => {
    if (window.scrollY > 300) {
      if (!isVisible) setIsVisible(true);
    } else {
      if (isVisible) setIsVisible(false);
    }
  }, [isVisible]);

  // Set up throttled scroll event listener
  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (throttleTimeout === null) {
        throttleTimeout = setTimeout(() => {
          toggleVisibility();
          throttleTimeout = null;
        }, 200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [toggleVisibility]);

  // Scroll to top smooth function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40"
    >
      <Button
        size="icon"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="rounded-full shadow-md h-10 w-10"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
} 