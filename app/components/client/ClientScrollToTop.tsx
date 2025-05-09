"use client";

import dynamic from 'next/dynamic';

// Dynamically import the ScrollToTop component to reduce initial load
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'), {
  ssr: false,
  loading: () => null,
});

export default function ClientScrollToTop() {
  return <ScrollToTop />;
} 