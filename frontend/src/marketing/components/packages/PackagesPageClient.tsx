"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/marketing/components/ui/button";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { packageDetailHref } from "@/marketing/lib/package-detail-slug";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import {
  CAMS_GRADIENT_ACCENT_TEXT_CLASS,
  PageCtaSection
} from "@/marketing/components/shared/PageCtaSection";
import { InterventionPackageIcon } from "@/marketing/components/shared/CamsIcon";
import { cn } from "@/marketing/lib/utils";
import { CAMS_UNSPLASH_PHOTO, camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";
import { PAGE_LAYOUT, PAGE_TYPOGRAPHY } from "@/marketing/components/shared/page-layout";
import { PackageBestForCallout } from "@/marketing/components/shared/PackageBestForCallout";
import { PackageFeaturesCollapsible } from "@/marketing/components/shared/PackageFeaturesCollapsible";
import { PackageTierHighlightBadge } from "@/marketing/components/shared/PackageTierHighlightBadge";
import {
  INTERVENTION_PACKAGES,
  PACKAGE_COMPARISON_ROWS,
  PACKAGE_FAQ_ITEMS,
  PACKAGE_STARTING_PRICES
} from "@/marketing/mock/intervention-packages";
import { fetchPublicApiJson } from "@/marketing/lib/public-api";
import {
  mapPackageListWithFallbacks,
  type PackageApiItem
} from "@/marketing/lib/package-api-mappers";
import { mapPackageFaqs, type FaqApiItem } from "@/marketing/lib/faq-api-mappers";
import { useCanViewPackagePricing } from "@/marketing/hooks/useCanViewPackagePricing";
import { ROUTES } from "@/shared/utils/routes";

function ComparisonCell({
  emphasized,
  isLastRow,
  children
}: {
  emphasized?: boolean;
  isLastRow?: boolean;
  children: string;
}): ReactElement {
  return (
    <td
      className={cn(
        "border-b border-l border-slate-100 px-4 py-5 text-sm text-cams-slate md:px-5",
        emphasized && "font-semibold text-cams-primary",
        isLastRow && "border-b-0"
      )}
    >
      {children}
    </td>
  );
}

export function PackagesPageClient({ intro }: { intro?: ReactNode }): ReactElement {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(-1);
  const [packages, setPackages] = useState(INTERVENTION_PACKAGES);
  const [faqItems, setFaqItems] = useState(PACKAGE_FAQ_ITEMS);
  const [comparePackageId, setComparePackageId] = useState(INTERVENTION_PACKAGES[0]?.id ?? "mercury");
  const { canViewPackagePricing, pricingGateLoading } = useCanViewPackagePricing();

  useEffect(() => {
    void Promise.all([
      fetchPublicApiJson<{ success: boolean; data?: PackageApiItem[] }>("/api/v1/packages"),
      fetchPublicApiJson<{ success: boolean; data?: FaqApiItem[] }>("/api/v1/faqs")
    ])
      .then(([packagesResponse, faqsResponse]) => {
        const apiPackages = packagesResponse.data ?? [];
        if (apiPackages.length > 0) {
          const mapped = mapPackageListWithFallbacks(apiPackages, INTERVENTION_PACKAGES);
          setPackages(mapped);
          setComparePackageId((current) =>
            mapped.some((pkg) => pkg.id === current) ? current : mapped[0]?.id ?? "mercury"
          );
        }

        setFaqItems(mapPackageFaqs(faqsResponse.data ?? [], PACKAGE_FAQ_ITEMS));
      })
      .catch(() => {
        // Keep mock fallbacks when API is unavailable.
      });
  }, []);

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Intervention <span className="text-cams-primary">Packages</span>
          </>
        }
        description="Eight solar-system tiers, from a short Mercury entry block through our Neptune flagship, so you can match hours, intensity, and reporting to your young person."
      />

      {intro}

      <section className={`bg-cams-soft ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <div className={`mb-8 overflow-hidden ${PAGE_LAYOUT.panel}`}>
            <div className="grid items-stretch md:grid-cols-[1.1fr_1fr]">
              <Image
                src={camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.goals, 1400, 860)}
                alt="Young person working towards goals with mentor support"
                className="h-full min-h-[240px] w-full object-cover"
                width={1400}
                height={860}
              />
              <div className="p-5 sm:p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
                  Outcome-led support
                </p>
                <h2 className="mt-3 font-heading text-2xl font-bold text-cams-dark md:text-3xl">
                  Choose a package that matches both risk and readiness
                </h2>
                <p className={`mt-3 ${PAGE_TYPOGRAPHY.body}`}>
                  Every tier is designed around practical engagement, confidence building, and
                  measurable progression. Start at the right level and scale support as outcomes
                  improve.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-cams-primary/20 bg-white p-4 sm:p-5 md:p-6">
            <p className={PAGE_TYPOGRAPHY.body}>
              {!pricingGateLoading && canViewPackagePricing ? (
                <>
                  Guide starting prices are listed below. All interventions are tailored to the
                  individual needs of the child or young person. Final pricing may vary depending on
                  risk, complexity and support requirements.
                </>
              ) : (
                <>
                  Pricing is available to registered parents, professionals and referral partners
                  after sign in. All interventions are tailored to the individual needs of the child
                  or young person. Final pricing may vary depending on risk, complexity and support
                  requirements.
                </>
              )}
            </p>
            {!pricingGateLoading && !canViewPackagePricing ? (
              <p className="mt-4">
                <Link
                  href={`${ROUTES.LOGIN}?redirect=${encodeURIComponent("/packages")}`}
                  className="text-sm font-semibold text-cams-primary underline-offset-2 hover:underline"
                >
                  Sign in to view guide prices
                </Link>
              </p>
            ) : null}
            {canViewPackagePricing ? (
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {packages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={packageDetailHref(pkg.id)}
                    className="rounded-xl border border-slate-200 bg-[#F1F5FB] px-3 py-2.5 text-center transition hover:border-cams-primary hover:bg-white"
                  >
                    <p className="text-xs font-semibold text-cams-dark">{pkg.name}</p>
                    <p className="mt-1 text-sm font-bold text-cams-primary">
                      {PACKAGE_STARTING_PRICES[pkg.id]}
                    </p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {packages.map((pkg) => (
              <article
                key={pkg.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border border-slate-200 bg-[#F1F5FB] p-5 sm:p-6 md:p-10 transition duration-300",
                  "hover:-translate-y-2 hover:border-cams-primary hover:shadow-md",
                  pkg.featured &&
                    "z-10 border-2 border-cams-primary bg-white shadow-md lg:scale-[1.02]",
                  pkg.packagesPageBadgeStyle === "outline" &&
                    "bg-white ring-2 ring-cams-secondary/35 ring-offset-2 ring-offset-white"
                )}
              >
                {pkg.packagesPageBadge && pkg.packagesPageBadgeStyle ? (
                  <PackageTierHighlightBadge
                    label={pkg.packagesPageBadge}
                    style={pkg.packagesPageBadgeStyle}
                  />
                ) : null}
                <div className="mt-2 flex items-center">
                  <InterventionPackageIcon packageId={pkg.id} size={44} />
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold text-cams-dark md:text-2xl">
                  {pkg.name}
                </h3>
                <p className={`mt-1 ${PAGE_TYPOGRAPHY.label}`}>{pkg.programmeSubtitle}</p>
                <p className="mt-3">
                  <Link
                    href={packageDetailHref(pkg.id)}
                    className="text-sm font-semibold text-cams-primary underline-offset-2 hover:underline"
                  >
                    View full details
                  </Link>
                </p>
                <p className="mt-4 font-heading text-base font-bold tracking-tight text-cams-dark md:text-lg">
                  {pkg.frequencyLine}
                </p>
                {!canViewPackagePricing ? (
                  <p className="mt-4 text-sm text-cams-slate">
                    Pricing available upon consultation.{" "}
                    <Link
                      href={`${ROUTES.LOGIN}?redirect=${encodeURIComponent("/packages")}`}
                      className="font-semibold text-cams-primary underline-offset-2 hover:underline"
                    >
                      Sign in
                    </Link>{" "}
                    to view guide prices.
                  </p>
                ) : null}
                <div className="mt-4 border-b border-slate-200 pb-6" />
                <PackageFeaturesCollapsible features={pkg.features} variant="packages" />
                <PackageBestForCallout variant="packages">{pkg.bestFor}</PackageBestForCallout>
                <div className="mt-4">
                  <Button
                    href="/contact"
                    variant="ghost"
                    className="mt-8 w-full rounded-[10px] border border-slate-200 bg-white py-4 text-base font-semibold text-cams-dark hover:border-cams-primary hover:bg-cams-primary/10 hover:text-cams-dark"
                  >
                    Request a Consultation
                  </Button>
                </div>
                <div className="mt-2">
                  <Button
                    href="/referral"
                    variant="ghost"
                    className="mt-3 w-full rounded-[10px] border border-transparent py-3 text-sm font-semibold text-cams-slate hover:border-slate-200 hover:bg-white hover:text-cams-dark"
                  >
                    Make a Referral
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`bg-white ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <header className={PAGE_LAYOUT.sectionHeader}>
            <h2 className={`${PAGE_TYPOGRAPHY.sectionHeading} tracking-tight text-cams-dark`}>
              Package <span className={CAMS_GRADIENT_ACCENT_TEXT_CLASS}>Comparison</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-base leading-relaxed text-cams-slate md:text-lg">
              Compare features across every tier, Mercury through Neptune, to find the right fit.
            </p>
            <p className="mx-auto mt-2 max-w-[700px] text-sm text-cams-ink-secondary md:hidden">
              Select a package below to compare features.
            </p>
          </header>

          <div className="mt-8 space-y-4 md:hidden">
            <div className="-mx-4 cams-thin-x-scroll flex gap-2 overflow-x-auto px-4 pb-1">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setComparePackageId(pkg.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    comparePackageId === pkg.id
                      ? "border-cams-primary bg-cams-primary text-white shadow-sm"
                      : "border-slate-200 bg-white text-cams-dark hover:border-cams-primary/40"
                  )}
                >
                  <InterventionPackageIcon packageId={pkg.id} size={18} className="inline" />
                  {pkg.name}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {PACKAGE_COMPARISON_ROWS.map((row, index) => {
                const cell = row.cells[comparePackageId];
                const isLast = index === PACKAGE_COMPARISON_ROWS.length - 1;
                return (
                  <div
                    key={row.feature}
                    className={cn(
                      "flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
                      isLast && "border-b-0"
                    )}
                  >
                    <dt className="text-sm font-bold text-cams-dark">{row.feature}</dt>
                    <dd
                      className={cn(
                        "text-sm text-cams-slate sm:max-w-[55%] sm:text-right",
                        cell?.emphasized && "font-semibold text-cams-primary"
                      )}
                    >
                      {cell?.text ?? "-"}
                    </dd>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 hidden -mx-4 overflow-x-auto rounded-xl px-4 shadow-sm sm:mx-0 sm:px-0 md:block">
            <table className="w-full min-w-[1040px] border-collapse overflow-hidden rounded-xl bg-white text-left text-sm md:min-w-[1280px] md:text-[0.9375rem]">
              <thead>
                <tr className="bg-[#F1F5FB]">
                  <th className="px-4 py-5 font-bold text-cams-dark md:px-5">Feature</th>
                  {packages.map((pkg) => (
                    <th
                      key={pkg.id}
                      className="whitespace-nowrap border-l border-slate-100 px-4 py-5 font-bold text-cams-dark md:px-5"
                    >
                      <Link
                        href={packageDetailHref(pkg.id)}
                        className="inline-flex items-center gap-2 underline-offset-2 hover:text-cams-primary hover:underline"
                      >
                        <InterventionPackageIcon packageId={pkg.id} size={22} className="inline" />
                        {pkg.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PACKAGE_COMPARISON_ROWS.map((row, index) => {
                  const isLast = index === PACKAGE_COMPARISON_ROWS.length - 1;
                  return (
                    <tr key={row.feature}>
                      <th
                        scope="row"
                        className={cn(
                          "border-b border-slate-200 px-4 py-5 text-left text-cams-dark md:px-5",
                          isLast && "border-b-0"
                        )}
                      >
                        <strong className="font-bold">{row.feature}</strong>
                      </th>
                      {packages.map((pkg) => (
                        <ComparisonCell
                          key={pkg.id}
                          emphasized={row.cells[pkg.id].emphasized}
                          isLastRow={isLast}
                        >
                          {row.cells[pkg.id].text}
                        </ComparisonCell>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={`bg-cams-soft ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <header className={PAGE_LAYOUT.sectionHeader}>
            <h2 className={`${PAGE_TYPOGRAPHY.sectionHeading} tracking-tight text-cams-dark`}>
              Frequently <span className={CAMS_GRADIENT_ACCENT_TEXT_CLASS}>Asked Questions</span>
            </h2>
          </header>

          <div className="mx-auto max-w-[900px] space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.q}
                  className={cn(
                    "overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-cams-primary hover:shadow-sm"
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-4 px-4 py-5 text-left text-base font-bold text-cams-dark transition md:px-6 md:text-lg",
                      "hover:bg-[#F1F5FB] hover:text-cams-primary",
                      isOpen && "bg-[#F1F5FB] text-cams-primary"
                    )}
                    onClick={() => {
                      setOpenFaqIndex((prev) => (prev === index ? -1 : index));
                    }}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <span
                      className={cn(
                        "shrink-0 text-2xl leading-none transition-transform",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="border-t border-slate-200 px-4 py-5 text-sm leading-relaxed text-cams-slate md:px-6 md:text-base">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PageCtaSection
        heading={
          <>
            Ready to <span className="text-cams-accent">Invest in Change</span>
          </>
        }
        description="Every young person deserves the chance to thrive. Let's find the right package and mentoring approach for your situation."
        actions={[
          { href: "/contact", label: "Request a Consultation", variant: "primary" },
          { href: "/referral", label: "Make a Referral", variant: "secondary" },
          { href: "/services", label: "View Services", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
