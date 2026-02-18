'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Something went wrong
            </h1>
            <p className="mb-6 text-gray-600">
              An unexpected error occurred whilst rendering the page.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


