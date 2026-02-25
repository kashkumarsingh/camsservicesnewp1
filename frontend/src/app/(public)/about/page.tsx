import Section from '@/components/layout/Section';
import CTASection from '@/components/shared/CTASection';
import Button from '@/components/ui/Button';
import { PageHero, RichTextBlock } from '@/components/shared/public-page';
import {
  AboutMissionSection,
  AboutCoreValuesSection,
  AboutSafeguardingSection,
} from '@/components/public-page/about';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { StaticPageRepository } from '@/infrastructure/persistence/pages/repositories/StaticPageRepository';
import type { AboutCoreValueDTO, PageDTO } from '@/core/application/pages/dto/PageDTO';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { withTimeoutFallback } from '@/utils/promiseUtils';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/utils/seoConstants';
import { ROUTES } from '@/utils/routes';
import { ABOUT_PAGE } from '@/app/(public)/constants/aboutPageConstants';

// Mark as dynamic because we use headers() in generateMetadata
export const dynamic = 'force-dynamic';

// Content source: Admin → Dashboard → Public Pages. Edit the page with slug "about" and type "About"
// (SideCanvas). Title → hero; Summary → hero subtitle; Content → optional main rich-text block.
// The editor uses the same form for all page types (no separate "About" section); we only show the
// CMS content block when data came from the API so static fallback doesn't duplicate the sections below.

const ABOUT_SLUG = 'about';

type AboutPageResult = { page: Awaited<ReturnType<StaticPageRepository['findBySlug']>> | PageDTO | null; fromApi: boolean };

async function getAboutPage(): Promise<AboutPageResult> {
  const useCase = new GetPageUseCase(pageRepository);
  const page = await withTimeoutFallback(useCase.execute(ABOUT_SLUG), 5000, null);

  if (page) {
    return { page, fromApi: true };
  }

  const staticRepo = new StaticPageRepository();
  const staticPage = await staticRepo.findBySlug(ABOUT_SLUG);
  return { page: staticPage, fromApi: false };
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const useCase = new GetPageUseCase(pageRepository);
  const page = await withTimeoutFallback(useCase.execute(ABOUT_SLUG), 5000, null);
  const staticRepo = new StaticPageRepository();
  const fallback = page ? null : await staticRepo.findBySlug(ABOUT_SLUG);
  const data = page ?? fallback;

  const title = data?.title ? `${data.title} - ${SEO_DEFAULTS.siteName}` : `About Us - ${SEO_DEFAULTS.siteName}`;
  const description =
    data?.summary ??
    'Discover our mission, values, and the passionate team behind CAMS Services, committed to SEN support and trauma-informed care.';

  return buildPublicMetadata(
    {
      title,
      description,
      path: ROUTES.ABOUT,
      imageAlt: data?.title ?? 'About CAMS Services',
    },
    baseUrl
  );
}

export default async function About() {
  const { page, fromApi } = await getAboutPage();

  const heroTitle = fromApi && page?.title ? page.title : ABOUT_PAGE.FALLBACK_HERO_TITLE;
  const heroDescription = fromApi && page?.summary ? page.summary : ABOUT_PAGE.FALLBACK_HERO_DESCRIPTION;
  const cmsContent = fromApi ? (page?.content?.trim() ?? '') : '';
  const hasCmsContent = cmsContent.length > 0;

  const missionTitle = (fromApi && (page as { mission?: { title?: string } })?.mission?.title)
    ? (page as { mission?: { title?: string } }).mission!.title
    : ABOUT_PAGE.DEFAULT_MISSION_TITLE;
  const missionDescription = fromApi && (page as { mission?: { description?: string } })?.mission?.description
    ? (page as { mission?: { description?: string } }).mission!.description
    : null;
  const missionTitleStr: string = missionTitle ?? ABOUT_PAGE.DEFAULT_MISSION_TITLE;

  const coreValuesData = fromApi && (page as { coreValues?: AboutCoreValueDTO[] })?.coreValues?.length
    ? (page as { coreValues: AboutCoreValueDTO[] }).coreValues
    : null;

  const safeguardingData = fromApi && (page as { safeguarding?: { title?: string; subtitle?: string; description?: string; badges?: string[] } })?.safeguarding
    ? (page as { safeguarding: { title?: string; subtitle?: string; description?: string; badges?: string[] } }).safeguarding
    : null;

  const coreValuesSectionTitle = fromApi && (page as { coreValuesSectionTitle?: string | null })?.coreValuesSectionTitle
    ? (page as { coreValuesSectionTitle: string }).coreValuesSectionTitle
    : ABOUT_PAGE.DEFAULT_CORE_VALUES_SECTION_TITLE;
  const coreValuesSectionSubtitle = fromApi && (page as { coreValuesSectionSubtitle?: string | null })?.coreValuesSectionSubtitle
    ? (page as { coreValuesSectionSubtitle: string }).coreValuesSectionSubtitle
    : ABOUT_PAGE.DEFAULT_CORE_VALUES_SECTION_SUBTITLE;

  return (
    <div>
      {/* Common: hero (reusable on any public page) */}
      <PageHero
        title={heroTitle}
        subtitle={heroDescription}
        videoSrc="/videos/space-bg-2.mp4"
      >
        <Button href={ROUTES.CONTACT} variant="superPlayful" size="lg" className="rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
          {ABOUT_PAGE.GET_IN_TOUCH}
        </Button>
        <Button href={ROUTES.SERVICES} variant="outline" size="lg" className="rounded-full bg-white text-primary-blue border-2 border-primary-blue shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
          {ABOUT_PAGE.VIEW_OUR_SERVICES}
        </Button>
      </PageHero>

      {/* Common: CMS rich-text block (reusable) */}
      {hasCmsContent && (
        <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Section>
            <RichTextBlock content={cmsContent} proseClassName="prose prose-lg md:prose-xl max-w-4xl mx-auto text-navy-blue" />
          </Section>
        </div>
      )}

      {/* Page-specific: About sections (Mission, Core Values, Safeguarding) */}
      <AboutMissionSection sectionTitle={missionTitleStr} description={missionDescription} />
      <AboutCoreValuesSection
        sectionTitle={coreValuesSectionTitle}
        sectionSubtitle={coreValuesSectionSubtitle}
        values={coreValuesData && coreValuesData.length >= 3 ? coreValuesData : []}
      />
      <AboutSafeguardingSection
        title={safeguardingData?.title ?? ABOUT_PAGE.DEFAULT_SAFEGUARDING_TITLE}
        subtitle={safeguardingData?.subtitle ?? ABOUT_PAGE.DEFAULT_SAFEGUARDING_SUBTITLE}
        description={safeguardingData?.description ?? ABOUT_PAGE.DEFAULT_SAFEGUARDING_DESCRIPTION}
        badges={safeguardingData?.badges}
      />

      {/* Common: CTA (reusable) */}
      <CTASection
        title={ABOUT_PAGE.CTA_TITLE}
        subtitle={ABOUT_PAGE.CTA_SUBTITLE}
        primaryCTA={{ text: ABOUT_PAGE.CTA_PRIMARY, href: ROUTES.CONTACT }}
        secondaryCTA={{ text: ABOUT_PAGE.CTA_SECONDARY, href: 'mailto:info@camsservices.co.uk' }}
        variant="gradient"
      />
    </div>
  );
}
