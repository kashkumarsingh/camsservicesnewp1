import type { ReactElement } from "react";
import {
  PROGRAMME_IMAGE_SEO,
  type ImageSeoRecord,
} from "@/marketing/content/image-seo-catalog";
import type { CamsProgrammeImageKey } from "@/marketing/mock/cams-public-images";

const FOOTER_IMAGE_RAIL_KEYS: readonly CamsProgrammeImageKey[] = [
  "outdoorEngagement",
  "boxingFitness",
  "community",
  "goals",
  "mentoring",
  "routine",
  "sen",
];

const FOOTER_IMAGE_RAIL_ITEMS: readonly ImageSeoRecord[] = FOOTER_IMAGE_RAIL_KEYS.map(
  (key) => PROGRAMME_IMAGE_SEO[key]
);

export function FooterImageRail(): ReactElement {
  const sequence = [...FOOTER_IMAGE_RAIL_ITEMS, ...FOOTER_IMAGE_RAIL_ITEMS];

  return (
    <div
      className="cams-cta-top-diagonal-clip cams-diagonal-overlap-top relative z-[1] border-b border-white/10 bg-cams-dark pt-[calc(var(--cams-diagonal-depth)+0.75rem)] md:pt-[calc(var(--cams-diagonal-depth)+1rem)]"
      aria-label="Programme photography strip"
    >
      <div className="cams-footer-rail-mask pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cams-dark to-transparent md:w-24" />
      <div className="cams-footer-rail-mask pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cams-dark to-transparent md:w-24" />
      <div className="cams-footer-rail-scroll overflow-hidden py-4 md:py-5">
        <div className="cams-footer-rail-track flex w-max gap-3 md:gap-4">
          {sequence.map((item, index) => (
            <figure
              key={`${item.path}-${String(index)}`}
              className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/30"
            >
              <img
                src={item.path}
                alt={item.alt}
                width={280}
                height={190}
                className="h-[140px] w-[200px] object-cover md:h-[170px] md:w-[260px]"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
