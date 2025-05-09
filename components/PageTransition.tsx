'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstMount, setIsFirstMount] = useState(true);

  // Only animate after the initial mount
  useEffect(() => {
    if (isFirstMount) setIsFirstMount(false);
  }, [isFirstMount]);

  // Even lighter animation for better performance
  return (
    <motion.div
      key={pathname}
      initial={isFirstMount ? { opacity: 1 } : { opacity: 0.98 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.05
      }}
      className="w-full min-h-[calc(100vh-3.5rem)]"
    >
      {children}
    </motion.div>
  );
} 