import type { ReactElement } from "react";
import Link from "next/link";
import { HomeEditorialParallaxImage } from "@/marketing/components/home/HomeEditorialParallaxImage";
import { CAMS_UNSPLASH_PHOTO, camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";
import { WHO_WE_SUPPORT_LIST } from "@/marketing/mock/cams-services-catalog";

export function HomeWhoWeSupportSection(): ReactElement {
  return (
    <section
      className="relative overflow-hidden bg-cams-soft px-4 py-24 md:px-10 md:py-32"
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

      <div className="relative mx-auto grid w-full max-w-[1600px] gap-16 lg:grid-cols-12 lg:items-start lg:gap-12">
        <article className="relative lg:col-span-5 lg:pt-4">
          <p
            className="pointer-events-none absolute -left-1 top-[-0.1em] font-heading text-[clamp(4.5rem,14vw,11rem)] font-bold leading-none tracking-tighter text-cams-primary/[0.07] sm:-left-3"
            aria-hidden
          >
            02
          </p>
          <div className="relative z-[1]">
            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cams-primary">Who we support</p>
              <span className="h-px min-w-[3rem] flex-1 bg-gradient-to-r from-cams-primary/35 to-transparent md:min-w-[5rem]" aria-hidden />
            </div>
            <h2
              id="home-audience-heading"
              className="mt-6 font-heading text-3xl font-bold leading-[1.08] tracking-tight text-cams-ink md:text-[2.65rem]"
            >
              Children, families, and{" "}
              <span className="bg-gradient-to-r from-cams-primary to-cams-secondary bg-clip-text text-transparent">
                partner organisations
              </span>
            </h2>
            <p className="mt-8 max-w-prose text-lg leading-[1.75] text-cams-ink-secondary">
              We work with individuals and organisations across education, social care, fostering, residential care,
              and community settings — always tailoring support around the person, not a fixed age bracket.
            </p>

            <Link
              href="/referral"
              className="group mt-12 inline-flex w-fit items-center gap-3 rounded-full border border-cams-primary/25 bg-white px-6 py-3 text-sm font-semibold text-cams-ink shadow-sm transition hover:border-cams-primary/45 hover:shadow-md"
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

        <div className="relative lg:col-span-6 lg:col-start-7">
          <div
            className="pointer-events-none absolute -right-8 top-12 hidden h-40 w-40 rounded-full border border-cams-primary/15 lg:block"
            aria-hidden
          />
          <div className="mb-8">
            <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cams-ink-tertiary">
              Who we support
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {WHO_WE_SUPPORT_LIST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white/80 px-4 py-3 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/25 hover:bg-white"
                >
                  <span className="size-2 shrink-0 rounded-full bg-cams-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <figure className="relative lg:translate-y-4 lg:pl-6">
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
