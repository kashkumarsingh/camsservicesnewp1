'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Something went wrong!
        </h1>
        <p className="mb-6 text-gray-600">
          We encountered an unexpected error. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 rounded-lg bg-red-50 p-4 text-left">
            <summary className="cursor-pointer font-semibold text-red-800">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-auto text-sm text-red-700">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="secondary"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

