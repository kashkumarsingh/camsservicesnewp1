import Link from 'next/link';
import MarketingButton from '@/design-system/components/Button/MarketingButton';
import { ROUTES } from '@/shared/utils/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <MarketingButton variant="primary">Go Home</MarketingButton>
          </Link>
          <Link href={ROUTES.CONTACT}>
            <MarketingButton variant="secondary">Contact Us</MarketingButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

