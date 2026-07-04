import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { GenericCmsPageView } from '@/marketing/components/pages/GenericCmsPageView';
import { buildCmsPageMetadata } from '@/marketing/server/metadata/buildCmsPageMetadata';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import { ROUTES } from '@/shared/utils/routes';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

/** Literal for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

async function getPageBySlug(slug: string) {
  const useCase = new GetPageUseCase(pageRepository);
  return withTimeoutFallback(useCase.execute(slug), 5000, null);
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: `Page not found | ${SEO_DEFAULTS.siteName}`,
    };
  }

  return buildCmsPageMetadata(page, ROUTES.PAGE_BY_SLUG(slug));
}

export default async function PublicPageBySlug({
  params,
}: PublicPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return <GenericCmsPageView page={page} />;
}
