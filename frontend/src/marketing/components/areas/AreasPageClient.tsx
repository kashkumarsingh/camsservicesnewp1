"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import FAQAccordion from "@/marketing/components/features/faq/FAQAccordion";
import {
  getLocationAreasByRegion,
  type LocationArea,
} from "@/marketing/content/locations";
import { ROUTES } from "@/shared/utils/routes";

const REGIONS = [
  { slug: "greater-london", label: "Greater London" },
  { slug: "hertfordshire", label: "Hertfordshire" },
  { slug: "berkshire", label: "Berkshire" },
] as const;

export function AreasPageClient(): ReactElement {
  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Service <span className="text-cams-primary">areas</span>
          </>
        }
        description="Chaperone service, child transport services, youth mentoring, SEND support and family support across West London and Hertfordshire. Choose your borough for local programmes and referral routes. CAMS services Ltd, HQ Greenford, Ealing."
      />

      <section className={`${PAGE_LAYOUT.panel} mt-10 p-5 sm:p-6 md:p-10`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Coverage</p>
        <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
          Where we <span className="text-cams-primary">deliver</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-cams-ink-secondary md:text-base">
          Each borough page covers chaperone service, chaperoning services, child transport, school transport
          support, youth mentoring, SEND support services, family support, behaviour support and sports programmes.
          Not only chaperone keywords.
        </p>

        <div className="mt-10 space-y-12">
          {REGIONS.map((region) => {
            const areas = getLocationAreasByRegion(region.slug);
            if (areas.length === 0) return null;
            return (
              <div key={region.slug}>
                <h3 className="font-heading text-xl font-bold text-cams-ink md:text-2xl">{region.label}</h3>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {areas.map((area) => (
                    <li key={area.slug}>
                      <AreaCard area={area} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
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
