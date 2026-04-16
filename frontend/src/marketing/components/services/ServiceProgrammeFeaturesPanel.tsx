import type { ReactElement } from "react";
import Image from "next/image";
import { Button } from "@/marketing/components/ui/button";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import { PROGRAMME_COVER_IMAGE_LAYOUT } from "@/marketing/constants/programmeCoverImageLayout";
import {
  serviceProgrammeImage,
  type ServiceProgrammeListItem
} from "@/marketing/mock/services-programmes";
import { ROUTES } from "@/shared/utils/routes";

type ServiceProgrammeFeaturesPanelProps = {
  programme: ServiceProgrammeListItem;
  /** When embedded on CMS service pages that already have hero CTAs, set false. */
  showCtaRow?: boolean;
  /** LCP image on standalone marketing detail pages. */
  imagePriority?: boolean;
};

/**
 * Programme image, tagline, and feature bullets — shared by marketing-only detail
 * and API-backed service detail when the slug matches {@link SERVICE_PROGRAMME_LIST}.
 */
export function ServiceProgrammeFeaturesPanel({
  programme,
  showCtaRow = true,
  imagePriority = false
}: ServiceProgrammeFeaturesPanelProps): ReactElement {
  const imageSrc = serviceProgrammeImage(programme);
  const { width, height } = PROGRAMME_COVER_IMAGE_LAYOUT.detailPanel;

  return (
    <section
      className={`relative overflow-hidden ${PAGE_LAYOUT.panel} px-4 py-10 md:px-8 md:py-12`}
      aria-labelledby="programme-features-heading"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cams-primary/[0.07] blur-3xl"
        aria-hidden
      />
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-12">
        <div className="brand-image-frame relative min-h-[260px] overflow-hidden rounded-3xl border border-slate-200 shadow-md lg:min-h-[420px]">
          <Image
            src={imageSrc}
            alt={programme.title}
            className="h-full w-full object-cover"
            width={width}
            height={height}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={imagePriority}
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Programme</p>
          <h2
            id="programme-features-heading"
            className="mt-2 font-heading text-2xl font-bold text-cams-ink md:text-3xl"
          >
            {programme.title}
          </h2>
          <p className="mt-3 text-sm font-medium text-cams-secondary md:text-base">{programme.tagline}</p>
          <ul className="mt-6 space-y-2.5 text-sm text-cams-slate md:text-base">
            {programme.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="font-bold text-cams-secondary" aria-hidden>
                  →
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {showCtaRow ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={ROUTES.CONTACT} variant="primary" size="lg">
                Contact us
              </Button>
              <Button href={ROUTES.SERVICES} variant="secondary" size="lg">
                All services
              </Button>
              <Button href={ROUTES.PACKAGES} variant="secondary" size="lg">
                View packages
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
