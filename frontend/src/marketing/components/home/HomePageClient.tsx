import type { ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/marketing/components/ui/button";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsStarRating, InterventionPackageIcon } from "@/marketing/components/shared/CamsIcon";
import { HomeHeroSection } from "@/marketing/components/home/HomeHeroSection";
import { HomeIntroSection } from "@/marketing/components/home/HomeIntroSection";
import { HomeMethodSection } from "@/marketing/components/home/HomeMethodSection";
import { HomeServicesGridSection } from "@/marketing/components/home/HomeServicesGridSection";
import { HomeTransportSupportSection } from "@/marketing/components/home/HomeTransportSupportSection";
import { HomeWhoWeSupportSection } from "@/marketing/components/home/HomeWhoWeSupportSection";
import { HomeBlogInsightsSection } from "@/marketing/components/home/HomeBlogInsightsSection";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";
import { packageDetailHref } from "@/marketing/lib/package-detail-slug";
import { CAMS_CONTACT, camsTelHref } from "@/marketing/mock/cams-services-catalog";

const sectionShell = "overflow-hidden px-4 py-20 md:py-28";
const container = PAGE_LAYOUT.container;

export function HomePageClient(): ReactElement {
  return (
    <div className="w-full bg-cams-soft">
      <HomeHeroSection />

      <HomeIntroSection />

      <HomeServicesGridSection />

      <HomeTransportSupportSection />

      <section className={`${sectionShell} bg-white`}>
        <div className={container}>
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-secondary">Packages</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-cams-ink md:text-5xl">
              Transparent tiers. Clear expectations.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-cams-ink-secondary">
              Choose the intensity that matches risk, attendance, and the outcomes you are working towards, then scale
              as confidence grows.
            </p>
          </header>

          <div className="mt-10 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-cams-soft/50 to-white p-6 shadow-sm md:mt-14 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-secondary">Hours by tier</p>
            <ul className="mt-5 divide-y divide-slate-200/90">
              {INTERVENTION_PACKAGES.map((pkg) => (
                <li
                  key={pkg.id}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white shadow-sm sm:size-12">
                    <InterventionPackageIcon packageId={pkg.id} size={28} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-1">
                    <div className="min-w-0">
                      <p className="font-heading text-base font-bold text-cams-ink md:text-lg">
                        <Link
                          href={packageDetailHref(pkg.id)}
                          className="hover:text-cams-primary hover:underline underline-offset-2"
                        >
                          {pkg.name}
                        </Link>
                        <span className="font-sans font-medium text-cams-ink-secondary">
                          , {pkg.programmeSubtitle}
                        </span>
                      </p>
                    </div>
                    <p className="font-heading text-sm font-bold tracking-tight text-cams-primary md:text-base">
                      <span>{pkg.frequencyLine}</span>
                      {pkg.homeDurationLine !== pkg.frequencyLine ? (
                        <span className="block font-medium text-cams-ink-secondary sm:inline">
                          <span className="hidden sm:inline" aria-hidden>
                            {" "}
                            ·{" "}
                          </span>
                          <span className="sm:hidden">Home: </span>
                          {pkg.homeDurationLine}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-4 border-t border-slate-200/90 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-cams-ink-secondary">
                Full comparison tables, pricing, features, and how to select a tier, continue on the packages page.
              </p>
              <Button href="/packages" variant="primary" size="lg" className="w-full shrink-0 sm:w-auto">
                View packages
              </Button>
            </div>
          </div>
        </div>
      </section>

      <HomeMethodSection />

      <HomeWhoWeSupportSection />

      <section className={`${sectionShell} bg-white`}>
        <div className={container}>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">Voices</p>
            <h2 className="mt-4 font-heading text-3xl font-bold text-cams-ink md:text-5xl">Outcomes worth hearing</h2>
            <p className="mt-4 text-lg leading-relaxed text-cams-ink-secondary">
              Families and referrers tell us what changes when mentoring is consistent, structured, and kind, with the
              same standards you will read in our policies and case studies.
            </p>
          </header>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                text: "My son went from school refusal to full attendance. The mentor believed in him when he did not believe in himself.",
                author: "Sarah M.",
                role: "Parent, school refusal support"
              },
              {
                text: "I finally have real friends and I am not scared anymore. My mentor helped me see I am not alone.",
                author: "Emma",
                role: "Confidence & social anxiety"
              },
              {
                text: "After ADHD diagnosis, we finally have a mentor with strategies that actually work for our family.",
                author: "David K.",
                role: "Parent, ADHD support"
              }
            ].map((t) => (
              <article
                key={t.author}
                className="flex h-full flex-col rounded-3xl border border-slate-200/90 bg-cams-soft/50 p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CamsStarRating />
                <p className="mt-5 flex-1 text-sm italic leading-relaxed text-cams-ink-secondary">“{t.text}”</p>
                <p className="mt-6 font-semibold text-cams-ink">{t.author}</p>
                <p className="text-sm text-cams-ink-tertiary">{t.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeBlogInsightsSection />

      <PageCtaSection
        heading="Need support for a child, young person, family member, or vulnerable adult?"
        description="Contact CAMS services today to discuss a tailored support package."
        actions={[
          { href: "/referral", label: "Make a Referral", variant: "primary" },
          { href: camsTelHref(CAMS_CONTACT.phone), label: "Call us", variant: "secondary" },
          { href: `mailto:${CAMS_CONTACT.email}`, label: "Email us", variant: "secondary" },
        ]}
      />
    </div>
  );
}
