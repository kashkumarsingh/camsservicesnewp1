import { Metadata } from 'next';
import React from 'react';
import { FooterImageRail } from '@/components/layout/FooterImageRail';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteFloatingActions } from '@/components/layout/SiteFloatingActions';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import { getSiteSettings } from '@/marketing/server/siteSettings/getSiteSettings';
import { SiteSettingsMapper } from '@/core/application/siteSettings/mappers/SiteSettingsMapper';
import { policiesData } from '@/data/policiesData';
import { ROUTES } from '@/shared/utils/routes';
import { PACKAGE_TIER_LINKS } from '@/marketing/lib/package-footer-links';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
      path: '/',
    },
    getMetadataBaseUrl()
  );
}




export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings().catch(() => null);
  const dto = settings ? SiteSettingsMapper.toDTO(settings) : null;
  const policyFooterLinks = policiesData.map((policy) => ({
    href: ROUTES.POLICIES_BY_SLUG(policy.slug),
    label: policy.title,
  }));

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
          title: 'Package tiers',
          links: PACKAGE_TIER_LINKS,
        },
        {
          title: 'Legal',
          links: policyFooterLinks,
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
        {children}
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
