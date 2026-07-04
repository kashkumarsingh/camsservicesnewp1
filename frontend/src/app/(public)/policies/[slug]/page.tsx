import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { ListPoliciesUseCase } from '@/core/application/pages/useCases/ListPoliciesUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { Metadata } from 'next';
import { buildCmsPageMetadata } from '@/marketing/server/metadata/buildCmsPageMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';
import { POLICY_DETAIL_PAGE as P } from '@/app/(public)/constants/policyDetailPageConstants';
import { PolicyDetailPageView } from '@/marketing/components/policies/PolicyDetailPageView';

function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}
import { notFound } from 'next/navigation';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

type PolicyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPolicy(slug: string) {
  const useCase = new GetPageUseCase(pageRepository);
  // Guard against slow or failing backend – return null instead of throwing during build
  return withTimeoutFallback(useCase.execute(slug), 5000, null);
}

async function getPolicySlugs(): Promise<string[]> {
  const useCase = new ListPoliciesUseCase(pageRepository);
  // If backend is unavailable during build, fall back to no static params
  const policies = await withTimeoutFallback(useCase.execute(), 5000, []);
  return policies.map((policy) => policy.slug);
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getPolicySlugs();
  if (!slugs.length) {
    // No slugs available – avoid build-time crash, let runtime handle 404s
    return [];
  }
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPolicy(slug);

  if (!page) {
    return buildCmsPageMetadata(
      {
        title: slug.replace(/-/g, ' '),
        summary: P.META_DESCRIPTION_FALLBACK,
      },
      ROUTES.POLICIES_BY_SLUG(slug),
      { type: 'article' }
    );
  }

  return buildCmsPageMetadata(page, ROUTES.POLICIES_BY_SLUG(slug), { type: 'article' });
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const page = await getPolicy(slug);

  if (!page) {
    notFound();
  }

  return (
    <PolicyDetailPageView
      page={page}
      isHtmlContent={isHtmlContent}
      labels={{
        lastUpdated: P.LAST_UPDATED,
        effectiveDate: P.EFFECTIVE_DATE,
        version: P.VERSION,
        views: P.VIEWS,
      }}
    />
  );
}


