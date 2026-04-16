import { PoliciesIndexPageView } from '@/marketing/components/policies/PoliciesIndexPageView';
import { ListPoliciesUseCase } from '@/core/application/pages/useCases/ListPoliciesUseCase';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { PageMapper } from '@/core/application/pages/mappers/PageMapper';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { StaticPageRepository } from '@/infrastructure/persistence/pages/repositories/StaticPageRepository';
import type { PoliciesPageContentDTO, PageDTO } from '@/core/application/pages/dto/PageDTO';
import { Metadata } from 'next';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';
import { POLICIES_PAGE } from '@/app/(public)/constants/policiesPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

const POLICIES_SLUG = 'policies';

async function getPolicies() {
  const useCase = new ListPoliciesUseCase(pageRepository);
  const policies = await withTimeoutFallback(useCase.execute(), 5000, []);
  return policies.map((page) => PageMapper.toDTO(page));
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
  return buildPublicMetadata(
    {
      title: POLICIES_PAGE.META_TITLE,
      description: POLICIES_PAGE.META_DESCRIPTION,
      path: ROUTES.POLICIES,
      imageAlt: POLICIES_PAGE.HERO_TITLE,
    },
    BASE_URL
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
  );
}
