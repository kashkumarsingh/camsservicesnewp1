import type { ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/marketing/components/ui/button";
import { MarketingBulletGrid } from "@/marketing/components/shared/MarketingBulletGrid";
import { MarketingSectionHeader } from "@/marketing/components/shared/MarketingSectionHeader";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import {
  TRANSPORT_SUPPORT_FOOTNOTE,
  TRANSPORT_SUPPORT_INTRO,
  TRANSPORT_SUPPORT_ITEMS,
} from "@/marketing/mock/cams-services-catalog";

export function HomeTransportSupportSection(): ReactElement {
  return (
    <section
      className={PAGE_LAYOUT.homeSectionWhite}
      aria-labelledby="home-transport-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-cams-secondary/[0.08] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-cams-primary/[0.06] blur-3xl"
        aria-hidden
      />

      <div className={`${PAGE_LAYOUT.homeContainer} grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16`}>
        <header className="lg:col-span-5">
          <MarketingSectionHeader
            id="home-transport-heading"
            eyebrow="Specialist transport"
            title={
              <>
                Child transport services &{" "}
                <span className="bg-gradient-to-r from-cams-primary to-cams-secondary bg-clip-text text-transparent">
                  school transport support
                </span>
              </>
            }
            description={TRANSPORT_SUPPORT_INTRO}
          />
          <p className="mt-6 text-sm leading-relaxed text-cams-ink-secondary md:text-base">
            {TRANSPORT_SUPPORT_FOOTNOTE}
          </p>
          <Link
            href="/services"
            className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full border border-cams-primary/25 bg-white px-6 py-3 text-sm font-semibold text-cams-ink shadow-sm transition hover:border-cams-primary/45 hover:shadow-md sm:w-fit"
          >
            View all services
            <span
              aria-hidden
              className="inline-flex size-8 items-center justify-center rounded-full bg-cams-soft text-cams-primary transition group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </header>

        <div className="lg:col-span-7">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-cams-ink-secondary">
            Support may include
          </p>
          <MarketingBulletGrid
            items={TRANSPORT_SUPPORT_ITEMS}
            icon="mapPin"
            columnsClassName="grid-cols-1 sm:grid-cols-2"
          />
        </div>
      </div>
    </section>
  );
}
