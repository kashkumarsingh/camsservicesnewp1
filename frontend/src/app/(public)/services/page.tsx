import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { ServiceList } from '@/interfaces/web/components/services';
import { Metadata } from 'next';
import { ROUTES } from '@/utils/routes';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { SERVICES_PAGE } from '@/app/(public)/constants/servicesPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: SERVICES_PAGE.META_TITLE,
      description: SERVICES_PAGE.META_DESCRIPTION,
      path: ROUTES.SERVICES,
      imageAlt: 'CAMS Services',
    },
    BASE_URL
  );
}

export default function Services() {


  return (
    <div>
      {/* Hero Section */}
      <Section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-screen flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/space-bg-2.mp4"
          loop
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 to-light-blue-cyan/20 z-10"></div>
        <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/dots-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            {SERVICES_PAGE.HERO_TITLE}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            {SERVICES_PAGE.HERO_SUBTITLE}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href={ROUTES.CONTACT} variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              {SERVICES_PAGE.HERO_CTA_REQUEST}
            </Button>
            <Button href={ROUTES.PACKAGES} variant="outline" size="lg" className="shadow-lg" withArrow>
              {SERVICES_PAGE.HERO_CTA_PACKAGES}
            </Button>
          </div>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section title={SERVICES_PAGE.SECTION_TITLE} subtitle={SERVICES_PAGE.SECTION_SUBTITLE} titleClassName="heading-text-shadow">
          <div className="mb-10">
            <ServiceList />
          </div>
          <div className="text-center">
            <Button href={ROUTES.PACKAGES} variant="secondary" size="lg" withArrow>
              {SERVICES_PAGE.SECTION_CTA}
            </Button>
          </div>
        </Section>
      </div>

      {/* CTA Section */}
      <CTASection
        title={SERVICES_PAGE.CTA_TITLE}
        subtitle={SERVICES_PAGE.CTA_SUBTITLE}
        primaryCTA={{ text: SERVICES_PAGE.CTA_PRIMARY, href: ROUTES.CONTACT }}
        secondaryCTA={{ text: SERVICES_PAGE.CTA_SECONDARY, href: ROUTES.PACKAGES }}
        variant="default"
      />
    </div>
  );
}
