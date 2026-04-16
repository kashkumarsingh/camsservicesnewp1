import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import {
  ABOUT_MISSION,
  ABOUT_STATS,
  ABOUT_STORY_FEATURE_IMAGE,
  ABOUT_STORY_MEDIA,
  ABOUT_TEAM,
  ABOUT_VALUES,
  ABOUT_WHY_FEATURE_IMAGE,
  ABOUT_WHY_POINTS
} from "@/marketing/mock/about-page";
import { CamsSpaceTeamAvatar } from "@/marketing/components/about/CamsSpaceTeamAvatar";

export function AboutPageClient(): ReactElement {
  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            About <span className="text-cams-accent">CAMS</span>
          </>
        }
        description="10+ years and 500+ families supported through consistent trust-first mentoring and structured interventions."
        layout="centered"
        height="short"
      />

      <section className={`relative overflow-hidden ${PAGE_LAYOUT.panel} px-4 py-14 md:px-8 md:py-20`}>
        <div
          className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-cams-primary/[0.08] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-24 h-64 w-64 rounded-full bg-cams-secondary/[0.08] blur-3xl"
          aria-hidden
        />
        <div className={PAGE_LAYOUT.contentContainer}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Our journey</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-cams-dark md:text-5xl">
              Our <span className="text-cams-primary">story</span>
            </h2>
            <p className="mt-5 text-base leading-8 text-cams-slate md:text-lg md:leading-8">
              CAMS exists so every young person can feel seen, supported, and able to move forward. We pair
              structured mentoring with boxing, fitness, routines, and community activity, because engagement
              often starts through doing, not just talking.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="relative">
              <div className="brand-image-frame aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src={ABOUT_STORY_MEDIA}
                  alt="Mentoring session in progress with a small group of young people"
                  className="h-full w-full object-cover"
                  width={900}
                  height={720}
                />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden w-[42%] max-w-[260px] translate-x-2 rounded-xl border-4 border-white bg-white shadow-xl md:block lg:-right-8">
                <Image
                  src={ABOUT_STORY_FEATURE_IMAGE}
                  alt="Close-up of teamwork during a CAMS activity session"
                  className="aspect-[3/4] w-full rounded-lg object-cover"
                  width={260}
                  height={347}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-cams-primary md:text-2xl">Built on real relationships</h3>
              <p className="leading-8 text-cams-slate">
                CAMS was founded on a simple belief: every young person deserves the chance to thrive. We began in
                schools and neighbourhoods, learning that when adults show up consistently, and use activity as a
                bridge, young people often re-engage with education, peer groups, and their own goals.
              </p>
              <p className="leading-8 text-cams-slate">
                From those early partnerships, CAMS grew into a full mentoring organisation supporting hundreds of
                families across the UK, with transparent routes for{" "}
                <Link href="/referral" className="font-semibold text-cams-primary underline-offset-4 hover:underline">
                  referral
                </Link>{" "}
                and a{" "}
                <Link href="/services" className="font-semibold text-cams-primary underline-offset-4 hover:underline">
                  menu of services
                </Link>{" "}
                schools can align to their cohorts.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <p className="font-heading text-2xl font-bold text-cams-primary">{ABOUT_STATS[0]?.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cams-slate">
                    {ABOUT_STATS[0]?.label}
                  </p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <p className="font-heading text-2xl font-bold text-cams-primary">{ABOUT_STATS[1]?.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cams-slate">
                    {ABOUT_STATS[1]?.label}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl px-4 py-14 md:px-8 md:py-16" aria-labelledby="about-stats-heading">
        <div className={`${PAGE_LAYOUT.contentContainer} rounded-3xl bg-gradient-to-br from-cams-dark via-slate-900 to-cams-dark px-6 py-12 text-white shadow-[0_30px_90px_rgba(2,6,23,0.45)] md:px-14 md:py-16`}>
          <h2 id="about-stats-heading" className="sr-only">
            CAMS at a glance
          </h2>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-secondary/85">CAMS at a glance</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
            {ABOUT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-6 text-center backdrop-blur-sm md:text-left"
              >
                <p className="font-heading text-4xl font-bold text-cams-accent md:text-5xl">{stat.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`relative overflow-hidden ${PAGE_LAYOUT.panelFrame} bg-gradient-to-b from-white to-slate-50/80 px-4 py-14 md:px-8 md:py-20`}>
        <div
          className="pointer-events-none absolute -right-12 top-20 h-52 w-52 rounded-full bg-cams-secondary/[0.06] blur-3xl"
          aria-hidden
        />
        <div className={PAGE_LAYOUT.contentContainer}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Our framework</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-cams-dark md:text-5xl">
              Mission &amp; <span className="text-cams-primary">values</span>
            </h2>
            <p className="mt-5 text-base leading-8 text-cams-slate md:text-lg">
              Our mission keeps every session honest: trusted relationships first, structured activity second, and
              outcomes that belong to the young person.
            </p>
          </div>

          <figure className="relative mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-cams-primary/90 via-cams-primary/80 to-cams-secondary/75 px-6 py-12 text-center text-white shadow-lg md:px-16 md:py-14">
            <figcaption className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
              Mission statement
            </figcaption>
            <blockquote className="mx-auto mt-6 max-w-3xl font-heading text-lg font-semibold leading-relaxed md:text-xl">
              {ABOUT_MISSION}
            </blockquote>
          </figure>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ABOUT_VALUES.map((value) => (
              <article
                key={value.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cams-primary/60 to-transparent"
                  aria-hidden
                />
                <div className="brand-image-frame relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={value.image}
                    alt=""
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cams-dark/50 to-transparent" aria-hidden />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-cams-dark">{value.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-cams-slate">{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panel} px-4 py-14 md:px-8 md:py-20`}>
        <div className={PAGE_LAYOUT.contentContainer}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">People behind CAMS</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-cams-dark md:text-5xl">
              Meet our <span className="text-cams-primary">team</span>
            </h2>
            <p className="mt-5 text-base leading-8 text-cams-slate md:text-lg">
              Trainers, mentors, and programme leads share one brief: stay consistent, stay curious, and keep young
              people safe while they grow.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ABOUT_TEAM.map((member) => (
              <article
                key={member.name}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="brand-image-frame overflow-hidden rounded-t-2xl">
                  <CamsSpaceTeamAvatar avatarKey={member.avatarKey} name={member.name} role={member.role} />
                </div>
                <div className="border-t border-slate-100 bg-white px-5 py-5">
                  <h3 className="text-lg font-bold text-cams-dark">{member.name}</h3>
                  <p className="mt-2 inline-flex rounded-full border border-cams-primary/20 bg-cams-primary/[0.07] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-cams-primary">
                    {member.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-cams-slate">
            Interested in joining us?{" "}
            <Link href="/careers" className="font-semibold text-cams-primary underline-offset-4 hover:underline">
              View careers and trainer roles
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-b from-cams-primary/[0.06] to-cams-secondary/[0.06] px-4 py-14 md:px-8 md:py-20">
        <div className={`${PAGE_LAYOUT.contentContainer} grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Why CAMS</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-cams-dark md:text-5xl">
              Why schools &amp; families choose{" "}
              <span className="text-cams-primary">CAMS</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-cams-slate md:text-lg">
              Practical reasons teams return to us, without watering down safeguarding or the quality of relationships.
            </p>
            <div className="brand-image-frame mt-10 overflow-hidden rounded-2xl shadow-lg lg:hidden">
              <Image
                src={ABOUT_WHY_FEATURE_IMAGE}
                alt="Mentor and young person taking part in an outdoor community-based CAMS activity"
                width={900}
                height={600}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
            <ul className="mt-10 space-y-4">
              {ABOUT_WHY_POINTS.map((point, index) => (
                <li
                  key={point.title}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-heading text-sm font-bold text-cams-primary shadow-sm ring-1 ring-slate-200/80">
                    {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-semibold text-cams-dark">{point.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-cams-slate">{point.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="brand-image-frame sticky top-28 hidden overflow-hidden rounded-2xl shadow-xl lg:block">
            <Image
              src={ABOUT_WHY_FEATURE_IMAGE}
              alt="Mentor and young person taking part in an outdoor community-based CAMS activity"
              width={900}
              height={1200}
              className="h-full max-h-[720px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <PageCtaSection
        heading={
          <>
            Let&apos;s work{" "}
            <span className="text-cams-secondary">together</span>
          </>
        }
        description="Ready to support a young person? Let's discuss how CAMS can help."
        actions={[
          { href: "/referral", label: "Make a Referral", variant: "primary" },
          { href: "/contact", label: "Book a Free Consultation", variant: "secondary" },
          { href: "/careers", label: "Explore Trainer Roles", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
