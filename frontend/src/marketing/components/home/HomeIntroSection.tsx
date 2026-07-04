import type { ReactElement } from "react";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import {
  COMPANY_KEY_MESSAGE,
  HOME_INTRO_PARAGRAPHS,
} from "@/marketing/mock/cams-services-catalog";

/** Intro copy below the home hero — keeps the hero band compact. */
export function HomeIntroSection(): ReactElement {
  return (
    <section
      className="relative border-b border-slate-200/80 bg-white px-4 py-12 md:px-10 md:py-16"
      aria-labelledby="home-intro-heading"
    >
      <div className={PAGE_LAYOUT.homeContainer}>
        <h2 id="home-intro-heading" className="sr-only">
          About CAMS chaperone services
        </h2>
        <div className="mx-auto max-w-3xl space-y-4 text-base leading-relaxed text-cams-ink-secondary md:text-lg">
          {HOME_INTRO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap gap-2">
          {COMPANY_KEY_MESSAGE.map((line) => (
            <li
              key={line}
              className="rounded-full border border-cams-primary/20 bg-cams-primary/[0.06] px-3 py-1.5 text-sm font-semibold text-cams-primary"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
