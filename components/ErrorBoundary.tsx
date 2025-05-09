'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Error caught by ErrorBoundary:', error);
      setError(error.error || new Error(error.message));
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error?.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reload page
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary; 