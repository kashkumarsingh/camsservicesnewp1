import type { ReactElement } from "react";
import { Button } from "@/marketing/components/ui/button";
import { HeroFloatingCardCollage } from "@/marketing/components/shared/HeroFloatingCardCollage";
import { camsVideoSrc } from "@/marketing/mock/cams-videos";

const STATS: ReadonlyArray<readonly [string, string]> = [
  ["500+", "Families supported"],
  ["100%", "DBS checked"],
  ["98%", "Satisfaction"],
  ["10+", "Years delivering"]
];

export function HomeHeroSection(): ReactElement {
  return (
    <section className="cams-hero-diagonal-clip relative min-h-[100svh] overflow-hidden px-4 pb-28 pt-20 text-white sm:px-6 sm:pb-32 md:pb-36 lg:px-10 lg:pb-40 lg:pt-24">
      <video
        className="cams-hero-video absolute inset-0 h-full w-full object-cover"
        src={camsVideoSrc("heroBackground")}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-br from-cams-dark/85 via-cams-primary/45 to-cams-secondary/35" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 20%, rgba(204,255,0,0.12), transparent 40%)"
        }}
      />
      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
        <div className="max-w-2xl lg:max-w-none">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cams-ink-onHero/95">
            Connect first · Then support change
          </p>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            1-2-1 Mentoring and intervention{" "}
            <span className="bg-gradient-to-r from-cams-secondary via-white to-cams-accent bg-clip-text text-transparent">
              that young people feel
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cams-ink-onHero/95 md:text-lg">
            We combine safeguarding discipline with relationship-led mentoring for 7 to 21 year olds, so everyone
            understands what happens first, how progress is reviewed, and what support looks like week to week across
            schools, homes and community settings.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/referral" size="lg" variant="ctaPrimary">
              Make a referral
            </Button>
            <Button href="/contact" size="lg" variant="ctaSecondary">
              Book a free call
            </Button>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/20 pt-10 sm:grid-cols-4">
            {STATS.map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-heading text-3xl font-bold text-cams-accent md:text-4xl">{value}</dd>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-cams-ink-onHero/80">{label}</p>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-cams-ink-onHero/75">
            Illustrative highlights across CAMS delivery, outcomes vary by context and tier of support.
          </p>
        </div>

        <HeroFloatingCardCollage />
      </div>
    </section>
  );
}
