'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BookNowStickyFooterProps {
  slug: string;
}

const BookNowStickyFooter: React.FC<BookNowStickyFooterProps> = ({ slug }) => {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  const dashboardUrl = childId
    ? `/dashboard/parent?package=${encodeURIComponent(slug)}&childId=${childId}`
    : `/dashboard/parent?package=${encodeURIComponent(slug)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-sticky bg-white p-4 shadow-lg md:hidden">
      <Link href={dashboardUrl} className="w-full flex items-center justify-center px-8 py-3 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
        Buy package (go to dashboard)
      </Link>
    </div>
  );
};

export default BookNowStickyFooter;


