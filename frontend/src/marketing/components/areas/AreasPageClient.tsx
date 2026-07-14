"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PagePrimaryImageSection } from "@/marketing/components/seo/PagePrimaryImageSection";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import FAQAccordion from "@/marketing/components/features/faq/FAQAccordion";
import {
  getCoreGreaterLondonAreas,
  getLocationAreasByRegion,
  getOuterLondonExpansionAreas,
  type LocationArea,
} from "@/marketing/content/locations";
import { AREAS_HUB_FAQ } from "@/marketing/content/locations/areas-hub-content";
import { ROUTES } from "@/shared/utils/routes";

type RegionSection = {
  slug: string;
  label: string;
  subtitle?: string;
  areas: readonly LocationArea[];
};

function buildRegionSections(): readonly RegionSection[] {
  return [
    {
      slug: "greater-london",
      label: "Greater London",
      subtitle: "West and North London boroughs from our Greenford HQ.",
      areas: getCoreGreaterLondonAreas(),
    },
    {
      slug: "outer-london",
      label: "Outer London",
      subtitle: "North East and South West boroughs bordering our core commissioning ring.",
      areas: getOuterLondonExpansionAreas(),
    },
    {
      slug: "hertfordshire",
      label: "Hertfordshire",
      areas: getLocationAreasByRegion("hertfordshire"),
    },
    {
      slug: "essex",
      label: "Essex",
      areas: getLocationAreasByRegion("essex"),
    },
    {
      slug: "berkshire",
      label: "Berkshire",
      areas: getLocationAreasByRegion("berkshire"),
    },
  ].filter((section) => section.areas.length > 0);
}

const REGION_SECTIONS = buildRegionSections();

export function AreasPageClient(): ReactElement {
  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Service <span className="text-cams-primary">areas</span>
          </>
        }
        description="Twenty-five borough and county hubs for chaperone service, child transport, youth mentoring, SEND support and family support across Greater London, Essex, Hertfordshire and Berkshire. CAMS Services Ltd, HQ Greenford, Ealing."
      />

      <PagePrimaryImageSection pagePath={ROUTES.AREAS} />

      <section className={`${PAGE_LAYOUT.panel} mt-10 p-5 sm:p-6 md:p-10`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Coverage</p>
        <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
          Where we <span className="text-cams-primary">deliver</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-cams-ink-secondary md:text-base">
          Each area page covers chaperone service, chaperoning services, child transport, school transport
          support, youth mentoring, SEND support services, family support, behaviour support and sports programmes.
          Open a borough or town for programme links and local referral routes.
        </p>

        <div className="mt-10 space-y-12">
          {REGION_SECTIONS.map((section) => (
            <div key={section.slug}>
              <h3 className="font-heading text-xl font-bold text-cams-ink md:text-2xl">{section.label}</h3>
              {section.subtitle ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-cams-ink-secondary">{section.subtitle}</p>
              ) : null}
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.areas.map((area) => (
                  <li key={area.slug}>
                    <AreaCard area={area} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panel} mt-10 p-5 sm:p-6 md:p-10`}>
        <FAQAccordion
          faqs={[...AREAS_HUB_FAQ]}
          title="Service areas: FAQs"
          description="Questions from schools, local authorities, foster agencies and families about borough coverage and referrals."
        />
      </section>

      <PageCtaSection
        heading="Need cover in your borough?"
        description="Tell us the young person's needs, postcodes and timescales. We respond within one working day."
        actions={[
          { href: ROUTES.REFERRAL, label: "Make a Referral", variant: "primary" },
          { href: ROUTES.CONTACT, label: "Contact Us", variant: "secondary" },
        ]}
      />
    </PageShell>
  );
}

function AreaCard({ area }: { area: LocationArea }): ReactElement {
  return (
    <Link
      href={ROUTES.AREA_BY_SLUG(area.slug)}
      className={`flex h-full flex-col ${PAGE_SURFACES.cardHoverLift} rounded-2xl border border-slate-200/90 bg-white p-5 no-underline sm:p-6`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading text-lg font-bold text-cams-ink">{area.name}</p>
        {area.isHeadquarters ? (
          <span className="shrink-0 rounded-full bg-cams-primary/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-cams-primary">
            HQ
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cams-slate">{area.councilTypeLabel}</p>
      <p className="mt-3 text-sm leading-6 text-cams-ink-secondary line-clamp-3">{area.heroDescription}</p>
      <p className="mt-2 text-xs font-medium text-cams-slate">
        Chaperone · transport · mentoring · SEND · {area.name}
      </p>
      <p className="mt-4 text-sm font-semibold text-cams-primary">View area →</p>
    </Link>
  );
}
