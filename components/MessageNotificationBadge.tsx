"use client";

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

interface MessageNotificationBadgeProps {
  className?: string;
}

export function MessageNotificationBadge({ className }: MessageNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUnreadCount = async () => {
      try {
        // Reset error state on each attempt
        if (isMounted) setError(false);
        
        const response = await fetch('/api/messages/unread-count');
        
        if (!isMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        } else {
          console.error('Error response:', response.status);
          setError(true);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching unread message count:', error);
        setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUnreadCount();

    // Shorter polling interval for more responsive notifications
    const intervalId = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Don't show anything during loading or on error, or when there are no unread messages
  if (loading || error || unreadCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs animate-pulse ${className}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
} 