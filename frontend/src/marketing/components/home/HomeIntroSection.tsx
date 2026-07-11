import type { ReactElement } from "react";
import Image from "next/image";
import { CamsIcon, type CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import {
  COMPANY_KEY_MESSAGE,
  HOME_INTRO_PARAGRAPHS,
} from "@/marketing/mock/cams-services-catalog";
import { PROGRAMME_IMAGE_SEO } from "@/marketing/content/image-seo-catalog";
import { CAMS_UNSPLASH_PHOTO, camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";

const TRUST_PROOF_POINTS: ReadonlyArray<{
  icon: CamsIconName;
  label: string;
  detail: string;
}> = [
  {
    icon: "heartHandshake",
    label: "Safeguarding-first",
    detail: "DBS-checked mentors and clear escalation routes",
  },
  {
    icon: "users",
    label: "Joined-up communication",
    detail: "Families, schools, and referrers stay aligned",
  },
  {
    icon: "lineChart",
    label: "Measured progression",
    detail: "Session goals, review points, and practical next steps",
  },
];

const INTRO_IMAGE = camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.community, 1400, 860);

/** Intro + trust block below the home hero — one cohesive section, full width. */
export function HomeIntroSection(): ReactElement {
  return (
    <section
      className="cams-cta-top-diagonal-clip cams-diagonal-overlap-top relative border-b border-slate-200/80 bg-cams-soft pb-14 pt-[calc(var(--cams-diagonal-depth)+3rem)] md:pb-20 md:pt-[calc(var(--cams-diagonal-depth)+4.5rem)]"
      aria-labelledby="home-intro-heading"
    >
      <div className={`${PAGE_LAYOUT.container} space-y-10 md:space-y-12`}>
        <div className={`overflow-hidden ${PAGE_LAYOUT.panel}`}>
          <div className="grid items-stretch lg:grid-cols-[1.05fr_1fr]">
            <Image
              src={INTRO_IMAGE}
              alt={PROGRAMME_IMAGE_SEO.community.alt}
              className="h-full min-h-[240px] w-full object-cover lg:min-h-[360px]"
              width={1400}
              height={860}
              priority
            />
            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
                UK chaperone services
              </p>
              <h2
                id="home-intro-heading"
                className="mt-3 font-heading text-2xl font-bold tracking-tight text-cams-ink md:text-3xl"
              >
                Chaperone services &amp; chaperone service for safe travel
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-cams-ink-secondary md:text-base">
                {HOME_INTRO_PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {COMPANY_KEY_MESSAGE.map((line) => (
                  <li
                    key={line}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cams-primary/20 bg-cams-primary/[0.06] px-3 py-1.5 text-xs font-semibold text-cams-primary md:text-sm"
                  >
                    <CamsIcon name="sparkles" size={14} strokeWidth={2} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm md:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-cams-primary/[0.08] blur-3xl"
            aria-hidden
          />
          <div className="relative z-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">
                Why CAMS is trusted
              </p>
              <h3 className="mt-3 font-heading text-2xl font-bold tracking-tight text-cams-ink md:text-3xl">
                Trusted delivery, not just good intentions.
              </h3>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TRUST_PROOF_POINTS.map((item) => (
                <li
                  key={item.label}
                  className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="inline-flex rounded-xl border border-cams-primary/15 bg-cams-primary/[0.08] p-2.5">
                    <CamsIcon name={item.icon} size={22} strokeWidth={1.5} />
                  </span>
                  <p className="mt-4 text-sm font-bold text-cams-ink">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-cams-ink-secondary">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
