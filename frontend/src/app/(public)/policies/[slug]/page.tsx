import Section from '@/components/layout/Section';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { ListPoliciesUseCase } from '@/core/application/pages/useCases/ListPoliciesUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { renderHtml } from '@/utils/htmlRenderer';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/utils/routes';
import { SEO_DEFAULTS } from '@/utils/seoConstants';
import { POLICY_DETAIL_PAGE as P } from '@/app/(public)/constants/policyDetailPageConstants';
import { formatDate } from '@/utils/formatDate';
import { DATE_FORMAT_LONG } from '@/utils/appConstants';

function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { withTimeoutFallback } from '@/utils/promiseUtils';

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

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || `${protocol}://${host}`;

  const title = page ? `${page.title} - ${SEO_DEFAULTS.siteName}` : `${slug.replace(/-/g, ' ')} - ${SEO_DEFAULTS.siteName}`;
  const description = page?.summary || P.META_DESCRIPTION_FALLBACK;

  return buildPublicMetadata(
    { title, description, path: ROUTES.POLICIES_BY_SLUG(slug), type: 'article' },
    baseUrl
  );
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const page = await getPolicy(slug);

  if (!page) {
    notFound();
  }

  const lastUpdated = page.lastUpdated ? new Date(page.lastUpdated) : undefined;
  const effectiveDate = page.effectiveDate ? new Date(page.effectiveDate) : undefined;

  return (
    <div>
      <Section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-primary-blue to-navy-blue">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/svgs/geometric-pattern.svg')", backgroundRepeat: 'repeat' }}
        />
        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight tracking-tight">{page.title}</h1>
          {page.summary && (
            <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-sans font-light">{page.summary}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/80">
            {lastUpdated && <span>{P.LAST_UPDATED}: {formatDate(lastUpdated, DATE_FORMAT_LONG)}</span>}
            {effectiveDate && <span>{P.EFFECTIVE_DATE}: {formatDate(effectiveDate, DATE_FORMAT_LONG)}</span>}
            <span>{P.VERSION}: {page.version}</span>
            <span>{page.views} {P.VIEWS}</span>
          </div>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <article className="prose prose-lg md:prose-xl max-w-4xl mx-auto text-navy-blue">
            {isHtmlContent(page.content ?? '')
              ? renderHtml(page.content ?? '', 'prose prose-lg md:prose-xl max-w-none')
              : <ReactMarkdown>{page.content ?? ''}</ReactMarkdown>}
          </article>
        </Section>
      </div>
    </div>
  );
}


