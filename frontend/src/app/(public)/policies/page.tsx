import { PoliciesIndexPageView } from '@/marketing/components/policies/PoliciesIndexPageView';
import { PoliciesSeoIntro } from '@/marketing/components/policies/PoliciesSeoIntro';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { StaticPageRepository } from '@/infrastructure/persistence/pages/repositories/StaticPageRepository';
import type { PoliciesPageContentDTO, PageDTO } from '@/core/application/pages/dto/PageDTO';
import { Metadata } from 'next';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';
import { buildCmsPageMetadata } from '@/marketing/server/metadata/buildCmsPageMetadata';
import { ROUTES } from '@/shared/utils/routes';
import { POLICIES_PAGE } from '@/app/(public)/constants/policiesPageConstants';
import { listPolicyPagesWithFallback } from '@/marketing/server/policies/policyPageData';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const POLICIES_SLUG = 'policies';

async function getPolicies() {
  return listPolicyPagesWithFallback();
}

async function getPoliciesPage(): Promise<
  PageDTO | Awaited<ReturnType<StaticPageRepository['findBySlug']>> | null
> {
  const useCase = new GetPageUseCase(pageRepository);
  const page = await withTimeoutFallback(useCase.execute(POLICIES_SLUG), 5000, null);
  if (page) return page;
  const staticRepo = new StaticPageRepository();
  return staticRepo.findBySlug(POLICIES_SLUG);
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPoliciesPage();

  return buildCmsPageMetadata(
    {
      title: page?.title?.trim() ?? POLICIES_PAGE.META_TITLE,
      summary: page?.summary?.trim() ?? POLICIES_PAGE.META_DESCRIPTION,
      metaTitle: page?.metaTitle,
      metaDescription: page?.metaDescription,
      ogImage: page?.ogImage,
    },
    ROUTES.POLICIES
  );
}

export default async function PoliciesIndexPage() {
  const [policies, page] = await Promise.all([
    getPolicies(),
    getPoliciesPage(),
  ]);

  const structuredContent: PoliciesPageContentDTO | undefined =
    page && 'structuredContent' in page
      ? (page as { structuredContent?: PoliciesPageContentDTO }).structuredContent
      : undefined;

  const heroTitle =
    structuredContent?.hero?.title ?? POLICIES_PAGE.FALLBACK_HERO_TITLE;
  const heroSubtitle =
    structuredContent?.hero?.subtitle ?? POLICIES_PAGE.FALLBACK_HERO_SUBTITLE;
  const introHeading = structuredContent?.intro?.heading ?? POLICIES_PAGE.DEFAULT_INTRO_HEADING;
  const introBody = structuredContent?.intro?.body ?? POLICIES_PAGE.DEFAULT_INTRO_BODY;

  return (
    <>
      <PoliciesSeoIntro />
      <PoliciesIndexPageView
      policies={policies}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      introHeading={introHeading}
      introBody={introBody}
      policiesBySlug={ROUTES.POLICIES_BY_SLUG}
      emptyMessage={POLICIES_PAGE.EMPTY_MESSAGE}
      emptyContact={POLICIES_PAGE.EMPTY_CONTACT}
      emptyContactSuffix={POLICIES_PAGE.EMPTY_CONTACT_SUFFIX}
      contactMailTo={POLICIES_PAGE.CONTACT_EMAIL_MAILTO}
      contactEmail={POLICIES_PAGE.CONTACT_EMAIL}
    />
    </>
  );
}
