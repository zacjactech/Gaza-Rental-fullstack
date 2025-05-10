'use client';

import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/app/lib/init-db';

export default function DatabaseInitializer() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip database initialization during build time
    if (process.env.NEXT_PUBLIC_SKIP_DB_CONNECTION === 'true' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping database initialization during build');
      setStatus('connected');
      return;
    }

    const initDB = async () => {
      try {
        console.log('Initializing database connection...');
        const success = await initializeDatabase();
        if (success) {
          console.log('Database connected successfully');
          setStatus('connected');
        } else {
          throw new Error('Database initialization returned false');
        }
      } catch (err) {
        console.error('Failed to connect to database:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown database connection error');
      }
    };

    initDB();
  }, []);

  // This component doesn't render anything visible
  return null;
} 