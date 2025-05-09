'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      // Log that the component has mounted
      console.log('Debug page loaded successfully');
      setLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in debug page:', err);
      setError(errorMessage);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h2 className="font-bold">Page Load Status:</h2>
        <p>{loaded ? '✅ Page loaded successfully' : '⏳ Page still loading...'}</p>
      </div>
      
      {error && (
        <div className="p-4 border rounded bg-red-50 text-red-800">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="font-bold mb-2">Environment Info:</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-60">
          {JSON.stringify(
            {
              nextRuntime: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
} 