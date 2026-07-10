"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import FAQAccordion from "@/marketing/components/features/faq/FAQAccordion";
import { getBorderingAreas, type LocationArea } from "@/marketing/content/locations";
import { getServiceProgrammeBySlug } from "@/marketing/mock/services-programmes";
import { ROUTES } from "@/shared/utils/routes";

type AreaLandingPageClientProps = {
  area: LocationArea;
};

export function AreaLandingPageClient({ area }: AreaLandingPageClientProps): ReactElement {
  const programmes = area.serviceSlugs
    .map((slug) => getServiceProgrammeBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => item != null);

  const bordering = getBorderingAreas(area);
  const faqs = area.faq.map((item) => ({ question: item.q, answer: item.a }));

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Chaperone services in <span className="text-cams-primary">{area.name}</span>
          </>
        }
        description={area.heroDescription}
      />

      <section className={`${PAGE_LAYOUT.panel} mt-10 p-5 sm:p-6 md:p-10`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">{area.councilTypeLabel}</p>
        <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
          {area.name} <span className="text-cams-primary">coverage</span>
        </h2>
        {area.isHeadquarters ? (
          <p className="mt-3 inline-flex rounded-full border border-cams-primary/25 bg-cams-primary/10 px-3 py-1 text-xs font-semibold text-cams-primary">
            CAMS services HQ, Greenford, Ealing
          </p>
        ) : null}
        <div className="mt-6 space-y-4 text-sm leading-7 text-cams-ink-secondary md:text-base">
          {area.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-4 text-sm text-cams-slate">{area.notes}</p>
      </section>

      <section className={`${PAGE_LAYOUT.panelFrame} mt-10 bg-gradient-to-b from-white to-slate-50/80 px-4 py-10 md:px-8 md:py-12`}>
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          Key <span className="text-cams-primary">neighbourhoods</span>
        </h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {area.keyAreas.map((neighbourhood) => (
            <li
              key={neighbourhood}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-cams-ink shadow-sm"
            >
              {neighbourhood}
            </li>
          ))}
        </ul>
      </section>

      <section className={`${PAGE_LAYOUT.panel} mt-10 p-5 sm:p-6 md:p-10`}>
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          Services in <span className="text-cams-primary">{area.name}</span>
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-cams-ink-secondary">
          Commission chaperone services, transport, mentoring and family support in {area.name}. Each programme
          links to full detail on our services pages.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((programme) => (
            <li key={programme.href}>
              <Link
                href={programme.href}
                className={`flex h-full flex-col ${PAGE_SURFACES.cardHoverLift} rounded-2xl border border-slate-200/90 bg-white p-5 no-underline`}
              >
                <div className="inline-flex rounded-xl border border-cams-primary/20 bg-cams-primary/[0.08] p-2.5">
                  <CamsIcon name={programme.listIcon} size={24} />
                </div>
                <p className="mt-3 font-heading text-base font-bold text-cams-ink">{programme.title}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-cams-ink-secondary">{programme.tagline}</p>
                <span className="mt-4 text-sm font-semibold text-cams-primary">View programme →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {bordering.length > 0 ? (
        <section className={`${PAGE_LAYOUT.panel} mt-10 p-5 sm:p-6 md:p-8`}>
          <h2 className="font-heading text-xl font-bold sm:text-2xl">
            Nearby <span className="text-cams-primary">service areas</span>
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {bordering.map((neighbour) => (
              <li key={neighbour.slug}>
                <Link
                  href={ROUTES.AREA_BY_SLUG(neighbour.slug)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-cams-primary transition hover:border-cams-primary/40"
                >
                  {neighbour.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={ROUTES.AREAS}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-cams-ink-secondary transition hover:border-cams-primary/40"
              >
                All areas
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <FAQAccordion
          faqs={faqs}
          title={`Chaperone services in ${area.name}: FAQs`}
          description={`Common questions from schools, local authorities and families commissioning cover in ${area.name}.`}
        />
      </section>

      <PageCtaSection
        className="mt-10"
        heading={`Refer chaperone services in ${area.name}`}
        description="Share postcodes, schedules and safeguarding context. We confirm feasibility and next steps within one working day."
        actions={[
          { href: ROUTES.REFERRAL, label: "Make a Referral", variant: "primary" },
          { href: ROUTES.CONTACT, label: "Contact Us", variant: "secondary" },
        ]}
      />
    </PageShell>
  );
}
