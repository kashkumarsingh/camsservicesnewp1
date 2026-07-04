import { Metadata } from 'next';
import React, { Suspense } from 'react';
import { FooterImageRail } from '@/components/layout/FooterImageRail';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteFloatingActions } from '@/components/layout/SiteFloatingActions';
import Loading from '@/components/ui/Loading/Loading';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { getSiteSettings } from '@/marketing/server/siteSettings/getSiteSettings';
import { SiteSettingsMapper } from '@/core/application/siteSettings/mappers/SiteSettingsMapper';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone Services UK | Child Transport & Family Support | CAMS Services',
      description:
        'Chaperone services UK, child transport services, school transport support, family support services, SEND support services, foster placement support, and mentoring services.',
      path: '/',
    },
    getMetadataBaseUrl()
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
            { href: '/referral', label: 'Make a referral' },
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
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
        <FooterImageRail />
        <SiteFooter
          sections={footerSections}
          description={footerDescription}
          copyrightText={footerCopyrightText}
        />
        <SiteFloatingActions contactPhone={dto?.contact?.phone} />
      </div>
    </>
  );
}
