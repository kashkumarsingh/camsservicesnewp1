import type { ReactElement } from "react";
import Link from "next/link";
import { HomeEditorialParallaxImage } from "@/marketing/components/home/HomeEditorialParallaxImage";
import { CAMS_UNSPLASH_PHOTO, camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";

export function HomeMethodSection(): ReactElement {
  return (
    <section
      className="relative overflow-hidden px-4 py-24 text-white md:px-10 md:py-32"
      aria-labelledby="home-method-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cams-dark"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 25%, rgba(0,102,255,0.4), transparent 42%), radial-gradient(circle at 88% 70%, rgba(0,212,255,0.28), transparent 48%)"
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-[1600px] gap-14 lg:grid-cols-12 lg:gap-6 lg:gap-y-0">
        <div className="relative lg:col-span-5 lg:row-span-1">
          <p
            className="pointer-events-none absolute -left-2 top-0 font-heading text-[clamp(4.5rem,14vw,11rem)] font-bold leading-none tracking-tighter text-white/[0.05] sm:-left-4 lg:left-[-0.15em]"
            aria-hidden
          >
            01
          </p>
          <div className="relative z-[1] mt-10 lg:mt-16 lg:pl-4">
            <div
              className="pointer-events-none absolute -left-6 top-1/2 h-[min(420px,55vw)] w-[min(420px,55vw)] -translate-y-1/2 rounded-full bg-cams-primary/25 blur-[100px]"
              aria-hidden
            />
            <figure className="relative">
              <div
                className="absolute -bottom-3 -right-3 hidden h-24 w-24 rounded-2xl border border-cams-accent/35 lg:block"
                aria-hidden
              />
              <div className="overflow-hidden rounded-2xl border border-white/15 shadow-[0_40px_100px_rgba(0,0,0,0.45)] ring-1 ring-white/10 lg:rounded-3xl">
                <HomeEditorialParallaxImage
                  src={camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.mentoring, 960, 640)}
                  alt="Mentor and young person in conversation during a session"
                  maxShiftPx={22}
                  frameClassName="aspect-[4/3] w-full lg:aspect-[3/2]"
                  imageClassName="aspect-[4/3] w-full object-cover lg:aspect-[3/2]"
                />
              </div>
            </figure>
          </div>
        </div>

        <article className="flex flex-col justify-center lg:col-span-6 lg:col-start-7 lg:max-w-xl lg:justify-center xl:max-w-none">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 shrink-0 bg-gradient-to-r from-cams-secondary to-transparent md:w-14" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cams-secondary/95">Method</p>
          </div>
          <h2
            id="home-method-heading"
            className="mt-6 font-heading text-3xl font-bold leading-[1.08] tracking-tight md:text-[2.65rem] lg:max-w-[20ch]"
          >
            Connect first.
            <span className="mt-3 block bg-gradient-to-r from-cams-secondary via-white/95 to-cams-accent bg-clip-text text-transparent">
              Then support change.
            </span>
          </h2>
          <p className="mt-8 max-w-prose text-base leading-[1.75] text-slate-200/95 md:text-lg">
            Behaviour shifts when trust lands first. We invest in rapport, predictable boundaries, and shared
            language with families and schools before we expect big moves on goals or attendance.
          </p>
          <Link
            href="/about"
            className="group mt-10 inline-flex w-fit items-center gap-3 rounded-full border border-white/25 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition hover:border-cams-accent/55 hover:bg-white/[0.12]"
          >
            Read our methodology
            <span
              aria-hidden
              className="inline-flex size-8 items-center justify-center rounded-full border border-white/20 text-cams-accent transition group-hover:translate-x-0.5 group-hover:border-cams-accent/50"
            >
              →
            </span>
          </Link>
        </article>
      </div>
    </section>
  );
}
