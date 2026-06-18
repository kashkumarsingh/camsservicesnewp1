import type { ReactElement } from "react";
import Link from "next/link";
import { HomeEditorialParallaxImage } from "@/marketing/components/home/HomeEditorialParallaxImage";
import { MarketingBulletGrid } from "@/marketing/components/shared/MarketingBulletGrid";
import { MarketingSectionHeader } from "@/marketing/components/shared/MarketingSectionHeader";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import { CAMS_UNSPLASH_PHOTO, camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";
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

      <div className={`${PAGE_LAYOUT.homeContainer} grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16`}>
        <article className="relative lg:col-span-5 lg:pt-4">
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
              description="We work with individuals and organisations across education, social care, fostering, residential care, and community settings, always tailoring support around the person, not a fixed age bracket."
            />

            <Link
              href="/referral"
              className="group mt-10 inline-flex w-full items-center justify-center gap-3 rounded-full border border-cams-primary/25 bg-white px-6 py-3 text-sm font-semibold text-cams-ink shadow-sm transition hover:border-cams-primary/45 hover:shadow-md sm:mt-12 sm:w-fit"
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

        <div className="relative flex flex-col gap-8 lg:col-span-6 lg:col-start-7">
          <div
            className="pointer-events-none absolute -right-8 top-12 hidden h-40 w-40 rounded-full border border-cams-primary/15 lg:block"
            aria-hidden
          />
          <div className="order-2 lg:order-1">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-cams-ink-secondary">
              Who we support
            </p>
            <MarketingBulletGrid
              items={WHO_WE_SUPPORT_LIST}
              columnsClassName="grid-cols-1 sm:grid-cols-2"
            />
          </div>
          <figure className="relative order-1 lg:order-2 lg:translate-y-2 lg:pl-6">
            <div
              className="absolute -left-4 top-8 hidden w-[42%] border-t border-l border-cams-primary/25 lg:block lg:min-h-[7rem]"
              aria-hidden
            />
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/60">
              <HomeEditorialParallaxImage
                src={camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.community, 960, 640)}
                alt="People taking part in a community engagement activity"
                maxShiftPx={18}
                frameClassName="aspect-[4/3] w-full lg:aspect-[3/2]"
                imageClassName="aspect-[4/3] w-full object-cover lg:aspect-[3/2]"
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
