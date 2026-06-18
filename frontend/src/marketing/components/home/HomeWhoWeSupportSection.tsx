import type { ReactElement } from "react";
import Link from "next/link";
import { MarketingBulletGrid } from "@/marketing/components/shared/MarketingBulletGrid";
import { MarketingSectionHeader } from "@/marketing/components/shared/MarketingSectionHeader";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import { WHO_WE_SUPPORT_LIST } from "@/marketing/mock/cams-services-catalog";

export function HomeWhoWeSupportSection(): ReactElement {
  return (
    <section
      className={`${PAGE_LAYOUT.homeSectionSoft} md:py-32`}
      aria-labelledby="home-audience-heading"
    >
      <div
        className="pointer-events-none absolute -right-20 top-24 h-[380px] w-[380px] rounded-full bg-cams-primary/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-[280px] w-[280px] rounded-full bg-cams-secondary/[0.08] blur-3xl"
        aria-hidden
      />

      <div className={`${PAGE_LAYOUT.homeContainer} grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12`}>
        <article className="relative lg:col-span-4 xl:col-span-4">
          <p
            className="pointer-events-none absolute -left-1 top-[-0.1em] font-heading text-[clamp(4.5rem,14vw,11rem)] font-bold leading-none tracking-tighter text-cams-primary/[0.07] sm:-left-3"
            aria-hidden
          >
            02
          </p>
          <div className="relative z-[1]">
            <MarketingSectionHeader
              id="home-audience-heading"
              eyebrow="Who we support"
              title={
                <>
                  Children, families, and{" "}
                  <span className="bg-gradient-to-r from-cams-primary to-cams-secondary bg-clip-text text-transparent">
                    partner organisations
                  </span>
                </>
              }
              description="We support children, families, foster carers, residential children's homes, schools, nurseries, and local authority support services partners, always tailoring support around the person, not a fixed age bracket."
            />

            <Link
              href="/referral"
              className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full border border-cams-primary/25 bg-white px-6 py-3 text-sm font-semibold text-cams-ink shadow-sm transition hover:border-cams-primary/45 hover:shadow-md sm:w-fit"
            >
              Make a referral
              <span
                aria-hidden
                className="inline-flex size-8 items-center justify-center rounded-full bg-cams-soft text-cams-primary transition group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </article>

        <div className="lg:col-span-8 xl:col-span-8">
          <MarketingBulletGrid
            items={WHO_WE_SUPPORT_LIST}
            columnsClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          />
        </div>
      </div>
    </section>
  );
}
