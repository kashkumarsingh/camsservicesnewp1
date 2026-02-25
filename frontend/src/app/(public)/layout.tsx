import { Metadata } from 'next';
import React, { Suspense } from 'react';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/ui/Loading/Loading';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';

// No dynamic here — add dynamic = 'force-dynamic' only on pages that use headers() (home, about)
// Base URL from env so layout can stay static and children can use revalidate
function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return url ? url.replace(/\/$/, '') : 'https://camsservice.co.uk';
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'CAMS Services - Chaperone, Activity, Mentoring & Support for Young People',
      description:
        'Specialist support for children with SEN, trauma, and additional needs. Book trauma-informed activities and packages with CAMS Services today.',
      path: '/',
    },
    getBaseUrl()
  );
}




export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-white">
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
