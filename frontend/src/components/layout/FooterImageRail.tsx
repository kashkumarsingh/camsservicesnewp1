import type { ReactElement } from "react";
import {
  camsProgrammeImagePath,
  type CamsProgrammeImageKey,
} from "@/marketing/mock/cams-public-images";

const FOOTER_IMAGE_RAIL_ITEMS: ReadonlyArray<{
  src: string;
  alt: string;
}> = [
  {
    src: camsProgrammeImagePath("outdoorEngagement" satisfies CamsProgrammeImageKey),
    alt: "Young person taking part in outdoor sports support",
  },
  {
    src: camsProgrammeImagePath("boxingFitness" satisfies CamsProgrammeImageKey),
    alt: "One-to-one fitness and wellbeing session",
  },
  {
    src: camsProgrammeImagePath("community" satisfies CamsProgrammeImageKey),
    alt: "Supported community access and travel",
  },
  {
    src: camsProgrammeImagePath("goals" satisfies CamsProgrammeImageKey),
    alt: "Behavioural management and goal-setting support",
  },
  {
    src: camsProgrammeImagePath("mentoring" satisfies CamsProgrammeImageKey),
    alt: "Mentoring and coaching conversation",
  },
  {
    src: camsProgrammeImagePath("routine" satisfies CamsProgrammeImageKey),
    alt: "Family support and relationship-building session",
  },
  {
    src: camsProgrammeImagePath("sen" satisfies CamsProgrammeImageKey),
    alt: "SEN and education support activity",
  },
];

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
              key={`${item.src}-${String(index)}`}
              className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/30"
            >
              <img
                src={item.src}
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
