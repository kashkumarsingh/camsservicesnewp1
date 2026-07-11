import type { ReactElement } from 'react';
import Link from 'next/link';
import { PageShell } from '@/marketing/components/shared/PageShell';
import { PageHeroBand } from '@/marketing/components/shared/PageHeroBand';
import { PageCtaSection } from '@/marketing/components/shared/PageCtaSection';
import { PagePrimaryImageSection } from '@/marketing/components/seo/PagePrimaryImageSection';
import FAQAccordion from '@/marketing/components/features/faq/FAQAccordion';
import { AreaContactSidebar } from '@/marketing/components/areas/AreaContactSidebar';
import { PAGE_LAYOUT } from '@/marketing/components/shared/page-layout';
import type { ServiceLocationPageContent } from '@/marketing/content/locations/service-location-page-content';
import type { LocationArea } from '@/marketing/content/locations/types';
import { ROUTES } from '@/shared/utils/routes';

type ServiceLocationPageClientProps = {
  area: LocationArea;
  serviceSlug: string;
  content: ServiceLocationPageContent;
};

export function ServiceLocationPageClient({
  area,
  serviceSlug,
  content,
}: ServiceLocationPageClientProps): ReactElement {
  const pagePath = ROUTES.AREA_SERVICE_BY_SLUG(area.slug, serviceSlug);
  const faqs = content.faq.map((item) => ({ question: item.q, answer: item.a }));

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand title={content.heroTitle} description={content.heroSubtitle} />

      <PagePrimaryImageSection pagePath={pagePath} areaName={area.name} />

      <div className={`${PAGE_LAYOUT.splitGrid} mt-10 lg:mt-12`}>
        <div className="order-2 space-y-10 lg:order-1">
          <section className={`${PAGE_LAYOUT.panel} p-5 sm:p-6 md:p-10`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">
              {area.councilTypeLabel} · {area.name}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
              Local <span className="text-cams-primary">delivery</span>
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-cams-ink-secondary md:text-base">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>
                  {paragraph.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
                    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (match) {
                      return (
                        <Link
                          key={`${match[2]}-${String(i)}`}
                          href={match[2]}
                          className="font-semibold text-cams-primary underline-offset-2 hover:underline"
                        >
                          {match[1]}
                        </Link>
                      );
                    }
                    return <span key={`${part.slice(0, 12)}-${String(i)}`}>{part}</span>;
                  })}
                </p>
              ))}
            </div>
          </section>

          <section className={`${PAGE_LAYOUT.panel} p-5 sm:p-6 md:p-10`}>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              Search phrases in <span className="text-cams-primary">{area.name}</span>
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {content.focusPhrases.map((phrase) => (
                <li
                  key={phrase}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-cams-ink shadow-sm md:text-sm"
                >
                  {phrase}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-cams-slate">
              <Link href={ROUTES.AREA_BY_SLUG(area.slug)} className="font-semibold text-cams-primary hover:underline">
                ← All programmes in {area.name}
              </Link>
            </p>
          </section>

          <section className={`${PAGE_LAYOUT.panelFrame} bg-gradient-to-b from-white to-slate-50/80 px-4 py-10 md:px-8 md:py-12`}>
            <FAQAccordion
              title={`${content.heroTitle}: FAQs`}
              description={`Common questions about this programme in ${area.name}.`}
              faqs={faqs}
            />
          </section>
        </div>

        <div className="order-1 lg:order-2">
          <AreaContactSidebar area={area} />
        </div>
      </div>

      <PageCtaSection
        heading={`Refer for ${content.heroTitle.toLowerCase()}`}
        description={`Submit a referral with postcodes, schedule and safeguarding context for ${area.name}.`}
        actions={[
          { href: ROUTES.REFERRAL, label: 'Make a referral', variant: 'primary' },
          { href: ROUTES.CONTACT, label: 'Contact CAMS', variant: 'secondary' },
        ]}
      />
    </PageShell>
  );
}
