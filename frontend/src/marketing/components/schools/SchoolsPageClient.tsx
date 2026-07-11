"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PagePrimaryImageSection } from "@/marketing/components/seo/PagePrimaryImageSection";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { MarketingBulletGrid } from "@/marketing/components/shared/MarketingBulletGrid";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { Button } from "@/marketing/components/ui/button";
import { PAGE_LAYOUT, PAGE_TYPOGRAPHY } from "@/marketing/components/shared/page-layout";
import { ROUTES } from "@/shared/utils/routes";
import { SCHOOLS_PAGE } from "@/app/(public)/constants/schoolsPageConstants";
import {
  SCHOOLS_CAMS_RESPONSIBILITIES,
  SCHOOLS_CORE_VALUES,
  SCHOOLS_INFORMATION_REQUIRED,
  SCHOOLS_ONBOARDING_CHECKLIST,
  SCHOOLS_PARTNER_RESPONSIBILITIES,
  SCHOOLS_PURPOSE_POINTS,
  SCHOOLS_QUALITY_COMMITMENTS,
  SCHOOLS_REFERRAL_STEPS,
  SCHOOLS_RELATED_POLICIES,
  SCHOOLS_REPORTING_UPDATES,
  SCHOOLS_SAFEGUARDING_ARRANGEMENTS,
  SCHOOLS_SERVICE_AREAS,
  SCHOOLS_WELCOME_PARAGRAPHS,
} from "@/marketing/content/schoolsPageContent";

type SchoolsPageClientProps = {
  intro?: ReactNode;
};

export function SchoolsPageClient({ intro }: SchoolsPageClientProps): ReactElement {
  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            School <span className="text-cams-primary">Partnerships</span>
          </>
        }
        description={SCHOOLS_PAGE.HERO_DESCRIPTION}
      />

      <PagePrimaryImageSection pagePath={ROUTES.SCHOOLS} />

      {intro}

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">
              Welcome to CAMS Services Ltd
            </h2>
            {SCHOOLS_WELCOME_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="w-full shrink-0 rounded-xl border border-cams-primary/20 bg-cams-primary/5 p-5 lg:max-w-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-cams-navy">
              School Onboarding Pack
            </h3>
            <p className="mt-2 text-sm leading-6 text-cams-slate">
              Download the full onboarding pack for your SENCO file, DSL records, or commissioning
              folder.
            </p>
            <a
              href={SCHOOLS_PAGE.ONBOARDING_PACK_PDF_PATH}
              download={SCHOOLS_PAGE.ONBOARDING_PACK_FILENAME}
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-cams-primary px-6 text-sm font-semibold text-white transition hover:bg-cams-primary/90"
            >
              Download PDF
            </a>
          </div>
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">Purpose of this pack</h2>
        <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
          The School Onboarding Pack is designed to:
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-cams-slate sm:text-base">
          {SCHOOLS_PURPOSE_POINTS.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cams-primary" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">About CAMS Services</h2>
        <p className="mt-3 max-w-[920px] text-sm leading-7 text-cams-slate sm:text-base">
          CAMS Services Ltd is a safeguarding-led organisation providing mentoring, intervention,
          advocacy, family support, and specialist services for children, young people, and families.
          We work in partnership with schools, local authorities, families, healthcare professionals,
          and other agencies. Every individual we support has unique strengths, experiences, and
          aspirations. Our services are tailored to meet individual needs with the aim of empowering
          people, reducing barriers, building resilience, and creating opportunities.
        </p>
        <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-cams-navy">Our approach</h3>
        <p className="mt-2 text-sm leading-7 text-cams-slate sm:text-base">
          Everything we do is guided by our core values:
        </p>
        <div className="mt-4">
          <MarketingBulletGrid
            items={[...SCHOOLS_CORE_VALUES]}
            columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          />
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">Services we provide</h2>
        <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
          Depending on individual needs, CAMS Services may provide:
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {SCHOOLS_SERVICE_AREAS.map((area) => (
            <article key={area.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-cams-navy">
                {area.title}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-cams-slate">
                {area.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-cams-primary" aria-hidden>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-cams-slate">
          Explore our{" "}
          <Link href={ROUTES.SERVICES} className="font-medium text-cams-primary hover:underline">
            services
          </Link>{" "}
          and{" "}
          <Link href={ROUTES.PACKAGES} className="font-medium text-cams-primary hover:underline">
            intervention packages
          </Link>{" "}
          for commissioning detail. Formal partnerships may use CAMS partnership and service
          agreement templates. Request these from your CAMS contact or via{' '}
          <Link href={ROUTES.CONTACT} className="font-medium text-cams-primary hover:underline">
            info@camsservices.co.uk
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-center font-mono text-3xl font-bold text-cams-navy sm:text-4xl">
          Referral and <span className="text-cams-primary">onboarding process</span>
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-7 text-cams-slate sm:text-base">
          Support normally follows structured stages from referral through to case closure. Additional
          information may be requested where required to ensure safe and effective service delivery.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SCHOOLS_REFERRAL_STEPS.map((step) => (
            <article
              key={step.number}
              className="relative rounded-2xl border-2 border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-cams-primary hover:shadow-lg"
            >
              <div className="absolute -top-4 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary font-mono text-xl font-bold text-white">
                {step.number}
              </div>
              <div className="mt-4 flex justify-center">
                <CamsIcon name={step.icon} size={40} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-cams-navy">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cams-slate">{step.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button href={ROUTES.REFERRAL} size="lg">
            Make a referral
          </Button>
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">
          Information required from schools
        </h2>
        <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
          To support effective planning, schools may be asked to provide:
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {SCHOOLS_INFORMATION_REQUIRED.map((group) => (
            <article key={group.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-cams-navy">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-cams-slate">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">
          Safeguarding and compliance
        </h2>
        <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
          Safeguarding is central to every aspect of our work. CAMS Services Ltd maintains robust
          safeguarding arrangements, including:
        </p>
        <div className="mt-4">
          <MarketingBulletGrid
            items={[...SCHOOLS_SAFEGUARDING_ARRANGEMENTS]}
            columnsClassName="grid-cols-1 sm:grid-cols-2"
          />
        </div>
        <p className="mt-4 text-sm leading-7 text-cams-slate sm:text-base">
          Any safeguarding concern will be managed promptly in accordance with statutory guidance and
          organisational procedures. Read our{" "}
          <Link
            href={ROUTES.POLICIES_BY_SLUG("safeguarding-policy")}
            className="font-medium text-cams-primary hover:underline"
          >
            safeguarding policy
          </Link>{" "}
          for public-facing detail.
        </p>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">Related policies</h2>
        <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
          Schools and commissioners can read our public transport standards before provision begins.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {SCHOOLS_RELATED_POLICIES.map((policy) => (
            <article
              key={policy.slug}
              className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-cams-navy">
                {policy.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-cams-slate">{policy.description}</p>
              <Link
                href={ROUTES.POLICIES_BY_SLUG(policy.slug)}
                className="mt-4 inline-flex text-sm font-semibold text-cams-primary hover:underline"
              >
                Read full policy
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">
              Communication and reporting
            </h2>
            <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
              Schools will receive agreed updates throughout the intervention, which may include:
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-cams-slate">
              {SCHOOLS_REPORTING_UPDATES.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cams-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-7 text-cams-slate">
              Communication arrangements will be agreed before support begins.
            </p>
          </div>
          <div>
            <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">
              Our commitment to quality
            </h2>
            <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
              CAMS Services Ltd is committed to delivering safe, effective, and high-quality services
              through:
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-cams-slate">
              {SCHOOLS_QUALITY_COMMITMENTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cams-secondary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">
          Partnership responsibilities
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <h3 className={`${PAGE_TYPOGRAPHY.cardHeading} text-cams-dark`}>CAMS Services Ltd will</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cams-slate">
              {SCHOOLS_CAMS_RESPONSIBILITIES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <h3 className={`${PAGE_TYPOGRAPHY.cardHeading} text-cams-dark`}>Schools will</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cams-slate">
              {SCHOOLS_PARTNER_RESPONSIBILITIES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">
          School onboarding checklist
        </h2>
        <p className="mt-3 text-sm leading-7 text-cams-slate sm:text-base">
          Before support begins, the following should normally be completed:
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SCHOOLS_ONBOARDING_CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-cams-slate"
            >
              <span className="text-cams-primary" aria-hidden>
                ☐
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-cams-slate">
          Use the downloadable pack to record completion dates and key contacts for your setting.
        </p>
      </section>

      <PageCtaSection
        heading={
          <>
            Ready to partner with <span className="text-cams-secondary">CAMS services</span>?
          </>
        }
        description="Submit a referral, download the onboarding pack, or contact our team to discuss commissioning for your school."
        actions={[
          { href: ROUTES.REFERRAL, label: "Make a referral", variant: "primary" },
          {
            href: SCHOOLS_PAGE.ONBOARDING_PACK_PDF_PATH,
            label: "Download onboarding pack",
            variant: "secondary",
          },
          { href: ROUTES.CONTACT, label: "Contact us", variant: "secondary" },
        ]}
      />
    </PageShell>
  );
}
