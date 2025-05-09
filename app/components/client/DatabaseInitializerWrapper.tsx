'use client';

import dynamic from 'next/dynamic';

// Dynamically import the DatabaseInitializer with no SSR
const DatabaseInitializer = dynamic(
  () => import('../DatabaseInitializer'),
  { ssr: false }
);

export default function DatabaseInitializerWrapper() {
  return <DatabaseInitializer />;
} 