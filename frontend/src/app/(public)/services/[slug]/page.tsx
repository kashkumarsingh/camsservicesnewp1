import { notFound } from 'next/navigation';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { RichTextBlock } from '@/components/shared/public-page';
import { GetServiceUseCase } from '@/core/application/services/useCases/GetServiceUseCase';
import { serviceRepository } from '@/infrastructure/persistence/services';
import { Metadata } from 'next';
import { ROUTES } from '@/utils/routes';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';
const imageUrl = '/og-images/og-image.jpg';

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
      title: 'Service Not Found - CAMS Services',
      description: 'The requested service could not be found.',
    };
  }

  return {
    title: `${service.title} - CAMS Services`,
    description: service.summary || service.description,
    openGraph: {
      title: `${service.title} - CAMS Services`,
      description: service.summary || service.description,
      url: `${BASE_URL}${ROUTES.SERVICE_BY_SLUG(service.slug)}`,
      type: 'website',
      images: [
        {
          url: `${BASE_URL}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: `${service.title} Service`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.title} - CAMS Services`,
      description: service.summary || service.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${BASE_URL}${ROUTES.SERVICE_BY_SLUG(service.slug)}`,
    },
  };
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
      <Section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            {validService.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            {validService.summary || validService.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button href={ROUTES.CONTACT} variant="primary" size="lg" withArrow>
              Contact us
            </Button>
            <Button href={ROUTES.SERVICES} variant="outline" size="lg" withArrow>
              All services
            </Button>
          </div>
        </div>
      </Section>

      <div className="py-16 bg-white">
        <Section>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Overview</h2>
            {validService.body ? (
              <RichTextBlock
                content={validService.body}
                proseClassName="prose prose-slate max-w-none text-slate-700"
              />
            ) : (
              <div className="prose prose-slate max-w-none text-slate-700">
                <p className="mb-6">
                  {validService.description}
                </p>
                <p className="mb-8">
                  To find out more about {validService.title.toLowerCase()} or discuss your child&apos;s needs, please contact us.
                </p>
              </div>
            )}
            <div className="mt-8">
              <Button href={ROUTES.CONTACT} variant="bordered" size="lg" withArrow>
                Contact us
              </Button>
            </div>
          </div>
        </Section>
      </div>

      <CTASection
        title="Get in touch"
        subtitle={`Contact us to discuss ${validService.title.toLowerCase()} or how we can support your child.`}
        primaryCTA={{ text: "Contact us", href: ROUTES.CONTACT }}
        secondaryCTA={{ text: "View packages", href: ROUTES.PACKAGES }}
        variant="default"
      />
    </div>
  );
}