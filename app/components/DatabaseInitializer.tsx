'use client';

import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/app/lib/init-db';

export default function DatabaseInitializer() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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