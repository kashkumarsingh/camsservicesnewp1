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
  const imageUrl = '/og-images/og-image.jpg';

  const useCase = new GetPageUseCase(pageRepository);
  const page = await withTimeoutFallback(useCase.execute(ABOUT_SLUG), 5000, null);
  const staticRepo = new StaticPageRepository();
  const fallback = page ? null : await staticRepo.findBySlug(ABOUT_SLUG);
  const data = page ?? fallback;

  const title = data?.title ? `${data.title} - CAMS Services` : 'About Us - CAMS Services';
  const description =
    data?.summary ??
    'Discover our mission, values, and the passionate team behind CAMS Services, committed to SEN support and trauma-informed care.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/about`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: data?.title ?? 'About CAMS Services',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/about`,
    },
  };
}

const FALLBACK_HERO_TITLE = "Our Story: Dedicated to Every Child's Potential";
const FALLBACK_HERO_DESCRIPTION =
  "Discover our mission, values, and the passionate team behind CAMS Services, committed to SEN support and trauma-informed care.";

export default async function About() {
  const { page, fromApi } = await getAboutPage();

  // When fromApi is false (static fallback), use hardcoded hero so we don't duplicate the sections below
  const heroTitle = fromApi && page?.title ? page.title : FALLBACK_HERO_TITLE;
  const heroDescription = fromApi && page?.summary ? page.summary : FALLBACK_HERO_DESCRIPTION;
  const cmsContent = fromApi ? (page?.content?.trim() ?? '') : '';
  const hasCmsContent = cmsContent.length > 0;

  const missionTitle = (fromApi && (page as { mission?: { title?: string } })?.mission?.title)
    ? (page as { mission?: { title?: string } }).mission!.title
    : 'Our Mission: Empowering Children and Young People';
  const missionDescription = fromApi && (page as { mission?: { description?: string } })?.mission?.description
    ? (page as { mission?: { description?: string } }).mission!.description
    : null;
  const missionTitleStr: string = missionTitle ?? 'Our Mission: Empowering Children and Young People';

  const coreValuesData = fromApi && (page as { coreValues?: AboutCoreValueDTO[] })?.coreValues?.length
    ? (page as { coreValues: AboutCoreValueDTO[] }).coreValues
    : null;

  const safeguardingData = fromApi && (page as { safeguarding?: { title?: string; subtitle?: string; description?: string; badges?: string[] } })?.safeguarding
    ? (page as { safeguarding: { title?: string; subtitle?: string; description?: string; badges?: string[] } }).safeguarding
    : null;

  const coreValuesSectionTitle = fromApi && (page as { coreValuesSectionTitle?: string | null })?.coreValuesSectionTitle
    ? (page as { coreValuesSectionTitle: string }).coreValuesSectionTitle
    : 'Our Core Values';
  const coreValuesSectionSubtitle = fromApi && (page as { coreValuesSectionSubtitle?: string | null })?.coreValuesSectionSubtitle
    ? (page as { coreValuesSectionSubtitle: string }).coreValuesSectionSubtitle
    : 'The principles that guide our every action.';

  return (
    <div>
      {/* Common: hero (reusable on any public page) */}
      <PageHero
        title={heroTitle}
        subtitle={heroDescription}
        videoSrc="/videos/space-bg-2.mp4"
      >
        <Button href="/contact" variant="superPlayful" size="lg" className="shadow-lg" withArrow>
          Get in Touch
        </Button>
        <Button href="/services" variant="outline" size="lg" className="shadow-lg" withArrow>
          View Our Services
        </Button>
      </PageHero>

      {/* Common: CMS rich-text block (reusable) */}
      {hasCmsContent && (
        <div className="py-20 bg-gradient-to-br from-slate-50 to-white">
          <Section>
            <RichTextBlock content={cmsContent} proseClassName="prose prose-lg md:prose-xl max-w-4xl mx-auto text-[#1E3A5F]" />
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
        title={safeguardingData?.title ?? 'Our Commitment to Safeguarding'}
        subtitle={safeguardingData?.subtitle ?? "Your child's safety and well-being are our highest priority."}
        description={
          safeguardingData?.description ??
          "The safety and wellbeing of your child is paramount. All our staff are DBS-checked, first-aid certified, and extensively trained in the latest UK safeguarding protocols."
        }
        badges={safeguardingData?.badges}
      />

      {/* Common: CTA (reusable) */}
      <CTASection
        title="Ready to Connect and Learn More?"
        subtitle="Contact our friendly team today for a free, no-obligation consultation about our SEN support and mentoring programmes."
        primaryCTA={{ text: "Book a Free Consultation", href: "/contact" }}
        secondaryCTA={{ text: "Email Our Team", href: "mailto:info@camsservices.co.uk" }}
        variant="default"
      />
    </div>
  );
}
