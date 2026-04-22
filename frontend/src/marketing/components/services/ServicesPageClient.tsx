"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { CamsIcon, type CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import { ServiceProgrammeJumpNav } from "@/marketing/components/services/ServiceProgrammeJumpNav";
import { ServicesProgrammeArticle } from "@/marketing/components/services/ServicesProgrammeArticle";
import { SERVICE_PROGRAMME_LIST } from "@/marketing/mock/services-programmes";
import { fetchPublicApiJson } from "@/marketing/lib/public-api";
import {
  mapServiceListWithFallbacks,
  type ServiceApiItem
} from "@/marketing/lib/services-api-mappers";

const PILLARS: ReadonlyArray<{
  icon: CamsIconName;
  title: string;
  text: string;
}> = [
  {
    icon: "heartHandshake",
    title: "Trust first",
    text: "Relationship quality comes before behaviour demands, so change sticks outside the session."
  },
  {
    icon: "activity",
    title: "Activity-led",
    text: "Structured programmes use sport, routines, and real-world tasks, not slides and lectures."
  },
  {
    icon: "users",
    title: "Joined-up",
    text: "We align with families, schools, and agencies so the young person hears one coherent story."
  }
];

const SERVICE_DISPLAY_ORDER: readonly string[] = [
  "SEN and Education Support",
  "Behavioural Management and Conflict Resolution",
  "Mentoring and Coaching",
  "Family Support Service",
  "Community Access and Transport Services",
  "Fitness and Wellbeing",
  "Sports Support Programme",
];

export function ServicesPageClient(): ReactElement {
  const [programmes, setProgrammes] = useState(SERVICE_PROGRAMME_LIST);
  const orderedProgrammes = useMemo(() => {
    const orderIndex = new Map(SERVICE_DISPLAY_ORDER.map((title, index) => [title, index]));
    return [...programmes].sort((a, b) => {
      const aIndex = orderIndex.get(a.title);
      const bIndex = orderIndex.get(b.title);
      if (aIndex == null && bIndex == null) return a.title.localeCompare(b.title);
      if (aIndex == null) return 1;
      if (bIndex == null) return -1;
      return aIndex - bIndex;
    });
  }, [programmes]);

  useEffect(() => {
    void fetchPublicApiJson<{ success: boolean; data?: ServiceApiItem[] }>("/api/v1/services")
      .then((response) => {
        const rows = response.data ?? [];
        if (rows.length === 0) {
          return;
        }

        setProgrammes(mapServiceListWithFallbacks(rows, SERVICE_PROGRAMME_LIST));
      })
      .catch(() => {
        // Keep mock fallback when API is unavailable.
      });
  }, []);

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Our <span className="text-cams-primary">Services</span>
          </>
        }
        description={
          <>
            Seven one-to-one programmes — sport, mentoring, community, education support, family, behaviour and
            fitness — designed to build confidence, engagement, and real change in young people&apos;s lives.
          </>
        }
      />

      <section
        aria-labelledby="services-model-heading"
        className={`relative mt-10 grid gap-5 overflow-hidden ${PAGE_LAYOUT.panel} p-5 md:grid-cols-3 md:p-8`}
      >
        <div
          className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-cams-primary/[0.08] blur-3xl"
          aria-hidden
        />
        <h2 id="services-model-heading" className="sr-only">
          How CAMS delivers mentoring
        </h2>
        {PILLARS.map((pillar) => (
          <article
            key={pillar.title}
            className={`relative ${PAGE_SURFACES.cardHoverLift} bg-gradient-to-br from-white to-slate-50/70 p-6`}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cams-secondary/50 to-transparent"
              aria-hidden
            />
            <div className="inline-flex rounded-xl border border-cams-primary/20 bg-cams-primary/[0.08] p-2.5">
              <CamsIcon name={pillar.icon} size={30} />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold text-cams-ink">{pillar.title}</h3>
            <p className="mt-2 text-sm leading-7 text-cams-ink-secondary">{pillar.text}</p>
          </article>
        ))}
      </section>

      <section className={`mt-12 space-y-10 ${PAGE_LAYOUT.panel} px-4 py-10 md:px-8 md:py-12`} aria-labelledby="services-programmes-heading">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Pathways</p>
          <h2 id="services-programmes-heading" className="font-heading text-3xl font-bold md:text-4xl">
            Programmes you can <span className="text-cams-primary">mix, match, and scale</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-cams-ink-secondary md:text-base md:leading-8">
            All programmes are delivered on a one-to-one basis, tailored to each young person with clear structure,
            consistency and safeguarding throughout.
          </p>
        </header>

        <ServiceProgrammeJumpNav programmes={orderedProgrammes} />

        <div className="flex flex-col gap-10">
          {orderedProgrammes.map((programme, index) => (
            <ServicesProgrammeArticle key={programme.href} programme={programme} index={index} />
          ))}
        </div>
      </section>

      <section className={`relative mt-16 overflow-hidden ${PAGE_LAYOUT.panelFrame} bg-gradient-to-b from-white to-slate-50/80 px-4 py-12 md:px-8 md:py-16`} aria-labelledby="services-outcomes-heading">
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-cams-secondary/[0.08] blur-3xl"
          aria-hidden
        />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Impact</p>
        <h2
          id="services-outcomes-heading"
          className="mt-3 text-center font-heading text-3xl font-bold md:text-4xl"
        >
          Expected <span className="text-cams-primary">outcomes</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-cams-slate md:text-base">
          These are the kinds of shifts families and schools often report when engagement and trust
          are built consistently over time.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["zap", "Improved engagement", "Greater willingness to participate and try new things."],
              ["brain", "Emotional regulation", "Healthier emotional responses and coping strategies."],
              ["trendingDown", "Reduced challenging behaviour", "Decreases in disruptive or harmful behaviours."],
              ["heartHandshake", "Relationship improvements", "Stronger trust with consistent adults."],
              ["star", "Increased confidence", "Improved self-esteem and self-belief."],
              ["trophy", "Goal achievement", "Measurable progress towards clear targets."]
            ] as const satisfies ReadonlyArray<readonly [CamsIconName, string, string]>
          ).map(([icon, title, text]) => (
            <article
              key={title}
              className={`${PAGE_SURFACES.cardHoverLiftPrimary} bg-white/90 p-6`}
            >
              <div className="inline-flex rounded-xl border border-cams-secondary/25 bg-cams-secondary/[0.09] p-2.5">
                <CamsIcon name={icon} size={30} />
              </div>
              <h3 className="mt-3 text-xl font-bold text-cams-ink">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-cams-ink-secondary">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <PageCtaSection
        heading="Ready to get started?"
        description="Tell us about your context and we will recommend the best support path for your young person."
        actions={[
          { href: "/risk-assessment", label: "Check risk suitability", variant: "secondary" },
          { href: "/referral", label: "Make a referral", variant: "primary" },
          { href: "/packages", label: "View packages", variant: "secondary" },
          { href: "/contact", label: "Book a consultation", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
