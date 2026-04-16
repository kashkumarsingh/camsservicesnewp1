import type { ReactElement } from "react";
import Image from "next/image";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import { ServiceProgrammeFeaturesPanel } from "@/marketing/components/services/ServiceProgrammeFeaturesPanel";
import { PROGRAMME_COVER_IMAGE_LAYOUT } from "@/marketing/constants/programmeCoverImageLayout";
import {
  getRelatedServiceProgrammes,
  serviceProgrammeImage,
  type ServiceProgrammeListItem
} from "@/marketing/mock/services-programmes";

type ServiceProgrammeMarketingDetailProps = {
  programme: ServiceProgrammeListItem;
};

export function ServiceProgrammeMarketingDetail({
  programme
}: ServiceProgrammeMarketingDetailProps): ReactElement {
  const related = getRelatedServiceProgrammes(programme.href, 4);
  const relatedDims = PROGRAMME_COVER_IMAGE_LAYOUT.relatedCard;

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand title={programme.title} description={programme.description} />

      <div className="mt-10">
        <ServiceProgrammeFeaturesPanel programme={programme} imagePriority />
      </div>

      {related.length > 0 ? (
        <section
          className={`mt-12 ${PAGE_LAYOUT.panel} px-4 py-10 md:px-8 md:py-12`}
          aria-labelledby="related-programmes-heading"
        >
          <h2
            id="related-programmes-heading"
            className="text-center font-heading text-2xl font-bold text-cams-ink md:text-3xl"
          >
            Other <span className="text-cams-primary">programmes</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-cams-ink-secondary md:text-base">
            Explore one-to-one pathways you can combine with this support.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white ${PAGE_SURFACES.cardHoverLift} no-underline`}
                >
                  <div className="relative aspect-[16/10] w-full shrink-0 bg-slate-100">
                    <Image
                      src={serviceProgrammeImage(item)}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      width={relatedDims.width}
                      height={relatedDims.height}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute bottom-3 left-3 inline-flex rounded-xl border border-white/40 bg-white/90 p-2 shadow-sm backdrop-blur-sm">
                      <CamsIcon name={item.listIcon} surface="light" size={24} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-5 pt-4">
                    <p className="font-heading text-[0.65rem] font-bold uppercase tracking-wide text-cams-primary">
                      {item.numberLabel}
                    </p>
                    <p className="mt-1 font-heading text-base font-bold leading-snug text-cams-ink">{item.title}</p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-cams-ink-secondary">
                      {item.tagline}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PageCtaSection
        className="mt-12"
        heading="Ready to get started?"
        description="Tell us about your context and we will recommend the best support path for your young person."
        actions={[
          { href: "/risk-assessment", label: "Check risk suitability", variant: "secondary" },
          { href: "/referral", label: "Make a referral", variant: "primary" },
          { href: "/packages", label: "View packages", variant: "secondary" },
          { href: "/contact", label: "Book a consultation", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
