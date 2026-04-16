import type { ReactElement } from "react";
import { Button } from "@/marketing/components/ui/button";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsStarRating, InterventionPackageIcon } from "@/marketing/components/shared/CamsIcon";
import { HomeHeroSection } from "@/marketing/components/home/HomeHeroSection";
import { HomeMethodSection } from "@/marketing/components/home/HomeMethodSection";
import { HomeServicesGridSection } from "@/marketing/components/home/HomeServicesGridSection";
import { HomeWhoWeSupportSection } from "@/marketing/components/home/HomeWhoWeSupportSection";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";

const sectionShell = "overflow-hidden px-4 py-20 md:py-28";
const container = PAGE_LAYOUT.container;
const TRUST_PROOF_POINTS = [
  { label: "Safeguarding-first", detail: "DBS-checked mentors and clear escalation routes" },
  { label: "Joined-up communication", detail: "Families, schools, and referrers stay aligned" },
  { label: "Measured progression", detail: "Session goals, review points, and practical next steps" }
] as const;

export function HomePageClient(): ReactElement {
  return (
    <div className="w-full bg-cams-soft">
      <HomeHeroSection />

      <section
        className={`cams-cta-top-diagonal-clip cams-diagonal-overlap-top relative border-b border-slate-200/80 bg-white pb-10 pt-[calc(var(--cams-diagonal-depth)+5rem)] md:pb-14 md:pt-[calc(var(--cams-diagonal-depth)+7rem)]`}
      >
        <div className={`${container} relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm md:p-10`}>
          <div
            className="pointer-events-none absolute -right-20 -top-16 h-52 w-52 rounded-full bg-cams-primary/[0.08] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-cams-secondary/[0.08] blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Why CAMS is trusted</p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-cams-ink md:text-4xl">
                Trusted delivery, not just good intentions.
              </h2>
            </div>
            <ul className="mx-auto grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TRUST_PROOF_POINTS.map((item) => (
                <li
                  key={item.label}
                  className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-bold text-cams-ink">{item.label}</p>
                  <p className="mt-2 text-xs leading-6 text-cams-ink-secondary md:text-sm">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <HomeServicesGridSection />

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
                        {pkg.name}
                        <span className="font-sans font-medium text-cams-ink-secondary">
                          , {pkg.programmeSubtitle}
                        </span>
                      </p>
                    </div>
                    <p className="shrink-0 font-heading text-sm font-bold tracking-tight text-cams-primary md:text-base">
                      <span>{pkg.frequencyLine}</span>
                      {pkg.homeDurationLine !== pkg.frequencyLine ? (
                        <span className="font-medium text-cams-ink-secondary">
                          {" "}
                          <span aria-hidden>·</span> {pkg.homeDurationLine}
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
                author: "Emma, age 12",
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

      <PageCtaSection
        heading={
          <>
            Ready to open the door for a{" "}
            <span className="text-cams-secondary">young person you care about</span>?
          </>
        }
        description="Tell us the story in a referral or book a call, and we will match intensity, programme mix, and safeguarding steps with honesty about what is realistic."
        actions={[
          { href: "/risk-assessment", label: "Check Risk Assessment", variant: "secondary" },
          { href: "/referral", label: "Make a Referral", variant: "primary" },
          { href: "/contact", label: "Book a Free Consultation", variant: "secondary" }
        ]}
      />
    </div>
  );
}
