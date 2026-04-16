import { Metadata } from 'next';
import React, { Suspense } from 'react';
import { FooterImageRail } from '@/components/layout/FooterImageRail';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteFloatingActions } from '@/components/layout/SiteFloatingActions';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { SiteCursor } from '@/components/layout/SiteCursor';
import Loading from '@/components/ui/Loading/Loading';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getSiteSettings } from '@/marketing/server/siteSettings/getSiteSettings';
import { SiteSettingsMapper } from '@/core/application/siteSettings/mappers/SiteSettingsMapper';

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




export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings().catch(() => null);
  const dto = settings ? SiteSettingsMapper.toDTO(settings) : null;
  const footerSections = dto?.footer?.quickLinks?.length
    ? [
        {
          title: 'Quick links',
          links: dto.footer.quickLinks,
        },
        {
          title: 'Families',
          links: [
            { href: '/login', label: 'Parent sign in' },
            { href: '/register', label: 'Parent sign up' },
            { href: '/contact', label: 'Make a referral' },
            { href: '/contact', label: 'Contact' },
          ],
        },
        {
          title: 'Partners',
          links: [
            { href: '/login', label: 'Trainer sign in' },
            { href: '/contact', label: 'School partnerships' },
            { href: '/packages', label: 'Intervention packages' },
            { href: '/about', label: 'About CAMS' },
          ],
        },
        {
          title: 'Organisation',
          links: [
            { href: '/become-a-trainer', label: 'Become a trainer' },
            { href: '/policies', label: 'Policies' },
            { href: '/faq', label: 'FAQs' },
            { href: '/contact', label: 'Contact' },
          ],
        },
      ]
    : undefined;
  const footerDescription = dto?.company?.description || undefined;
  const footerCopyrightText =
    dto?.copyright?.text?.replace('{year}', new Date().getFullYear().toString()) || undefined;

  return (
    <>
      <div className="min-h-screen overflow-x-clip bg-white">
        <SiteCursor />
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
        <FooterImageRail />
        <SiteFooter
          sections={footerSections}
          description={footerDescription}
          copyrightText={footerCopyrightText}
        />
        <SiteFloatingActions />
        <CookieConsent />
      </div>
    </>
  );
}
