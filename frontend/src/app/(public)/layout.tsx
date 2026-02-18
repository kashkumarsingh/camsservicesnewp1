import { Metadata } from 'next';
import { headers } from 'next/headers';
import React, { Suspense } from 'react';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/ui/Loading/Loading';

// Mark as dynamic because we use headers() in generateMetadata
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const imageUrl = '/og-images/og-image.jpg'; // Default OG image for public pages

  return {
    title: 'CAMS Services - Chaperone, Activity, Mentoring & Support for Young People',
    description: 'Specialist support for children with SEN, trauma, and additional needs. Book trauma-informed activities and packages with CAMS Services today.',
    openGraph: {
      title: 'CAMS Services - Support for Young People',
      description: 'Trauma-informed care and activities for children with SEN and additional needs in Buckhurst Hill, England.',
      url: baseUrl,
      type: 'website',
      images: [
        {
          url: `${baseUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: 'CAMS Services',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'CAMS Services - Support for Young People',
      description: 'Trauma-informed care and activities for children with SEN and additional needs.',
      images: [`${baseUrl}${imageUrl}`],
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}




export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=YOUR_GTM_ID"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
        <Footer />
      </div>
    </>
  );
}
