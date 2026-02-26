import { notFound } from 'next/navigation';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { RichTextBlock } from '@/components/shared/public-page';
import { GetServiceUseCase } from '@/core/application/services/useCases/GetServiceUseCase';
import { serviceRepository } from '@/infrastructure/persistence/services';
import { Metadata } from 'next';
import { ROUTES } from '@/utils/routes';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/utils/seoConstants';
import { SERVICE_DETAIL_PAGE } from '@/app/(public)/constants/serviceDetailPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const useCase = new GetServiceUseCase(serviceRepository);
  const service = await useCase.execute(slug);

  if (!service || !service.published) {
    return {
      title: SERVICE_DETAIL_PAGE.META_NOT_FOUND_TITLE,
      description: SERVICE_DETAIL_PAGE.META_NOT_FOUND_DESCRIPTION,
    };
  }

  const title = `${service.title} - ${SEO_DEFAULTS.siteName}`;
  const description = service.summary || service.description || undefined;
  return buildPublicMetadata(
    {
      title,
      description,
      path: ROUTES.SERVICE_BY_SLUG(service.slug),
      imageAlt: SERVICE_DETAIL_PAGE.OG_IMAGE_ALT_TEMPLATE.replace('{{title}}', service.title),
    },
    BASE_URL
  );
}

import { withTimeoutFallback } from '@/utils/promiseUtils';

export default async function ServiceDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const useCase = new GetServiceUseCase(serviceRepository);
  const service = await withTimeoutFallback(
    useCase.execute(slug),
    3500, // 3.5s timeout – service detail can wait a bit, but not block too long
    null
  );

  if (!service || !service.published) {
    notFound();
  }

  // TypeScript doesn't recognize that notFound() throws, so we assert service is non-null
   
  const validService = service!;

  return (
    <div>
      <Section className="border-b border-primary-blue/20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-navy-blue">
            {validService.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-navy-blue/80 max-w-2xl mx-auto">
            {validService.summary || validService.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button href={ROUTES.CONTACT} variant="primary" size="lg" withArrow>
              {SERVICE_DETAIL_PAGE.CTA_CONTACT}
            </Button>
            <Button href={ROUTES.SERVICES} variant="outline" size="lg" withArrow>
              {SERVICE_DETAIL_PAGE.CTA_ALL_SERVICES}
            </Button>
          </div>
        </div>
      </Section>

      <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Section>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-heading font-bold text-navy-blue mb-6">{SERVICE_DETAIL_PAGE.OVERVIEW_HEADING}</h2>
            {validService.body ? (
              <RichTextBlock
                content={validService.body}
                proseClassName="prose prose-lg max-w-none prose-headings:text-navy-blue prose-p:text-navy-blue/80 prose-a:text-primary-blue"
              />
            ) : (
              <div className="prose prose-lg max-w-none prose-headings:text-navy-blue text-navy-blue/80">
                <p className="mb-6">
                  {validService.description}
                </p>
                <p className="mb-8">
                  {SERVICE_DETAIL_PAGE.FALLBACK_DESCRIPTION.replace(
                    'this service',
                    validService.title.toLowerCase()
                  )}
                </p>
              </div>
            )}
            <div className="mt-8">
              <Button href={ROUTES.CONTACT} variant="bordered" size="lg" withArrow>
                {SERVICE_DETAIL_PAGE.CTA_CONTACT}
              </Button>
            </div>
          </div>
        </Section>
      </div>

      <CTASection
        title={SERVICE_DETAIL_PAGE.CTA_TITLE}
        subtitle={SERVICE_DETAIL_PAGE.CTA_SUBTITLE_TEMPLATE.replace('{{title}}', validService.title.toLowerCase())}
        primaryCTA={{ text: SERVICE_DETAIL_PAGE.CTA_CONTACT, href: ROUTES.CONTACT }}
        secondaryCTA={{ text: SERVICE_DETAIL_PAGE.CTA_VIEW_PACKAGES, href: ROUTES.PACKAGES }}
        variant="default"
      />
    </div>
  );
}