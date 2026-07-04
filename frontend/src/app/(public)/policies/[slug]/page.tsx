import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildCmsPageMetadata } from '@/marketing/server/metadata/buildCmsPageMetadata';
import { ROUTES } from '@/shared/utils/routes';
import { POLICY_DETAIL_PAGE as P } from '@/app/(public)/constants/policyDetailPageConstants';
import { PolicyDetailPageView } from '@/marketing/components/policies/PolicyDetailPageView';
import {
  getPolicyPageWithFallback,
  getStaticPolicySlugs,
  listPolicyPagesWithFallback,
} from '@/marketing/server/policies/policyPageData';

function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

type PolicyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPolicySlugs(): Promise<string[]> {
  const policies = await listPolicyPagesWithFallback();
  if (policies.length > 0) {
    return policies.map((policy) => policy.slug);
  }
  return getStaticPolicySlugs();
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
  const page = await getPolicyPageWithFallback(slug);

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
  const page = await getPolicyPageWithFallback(slug);

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


