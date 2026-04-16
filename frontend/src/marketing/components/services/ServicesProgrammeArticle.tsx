import type { ReactElement } from "react";
import Image from "next/image";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { Button } from "@/marketing/components/ui/button";
import { PROGRAMME_COVER_IMAGE_LAYOUT } from "@/marketing/constants/programmeCoverImageLayout";
import {
  serviceProgrammeImage,
  type ServiceProgrammeListItem
} from "@/marketing/mock/services-programmes";

type ServicesProgrammeArticleProps = {
  programme: ServiceProgrammeListItem;
  index: number;
};

export function ServicesProgrammeArticle({
  programme,
  index
}: ServicesProgrammeArticleProps): ReactElement {
  const imageSrc = serviceProgrammeImage(programme);
  const { width, height } = PROGRAMME_COVER_IMAGE_LAYOUT.servicesArticle;
  const reverse = index % 2 === 1;

  return (
    <article
      id={programme.anchorId}
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-cams-primary/40 hover:shadow-lg"
    >
      <div className="grid lg:grid-cols-[1.15fr_1fr] lg:items-stretch">
        <div className={`${reverse ? "lg:order-2" : ""}`}>
          <div className="brand-image-frame relative min-h-[280px] lg:min-h-[420px]">
            <Image
              src={imageSrc}
              alt={programme.title}
              className="h-full w-full object-cover"
              width={width}
              height={height}
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 shadow-md backdrop-blur-sm md:hidden">
              <CamsIcon name={programme.listIcon} surface="light" size={32} />
              <div>
                <p className="font-heading text-[0.65rem] font-bold uppercase tracking-wide text-cams-primary">
                  {programme.numberLabel}
                </p>
                <h3 className="font-bold text-cams-dark">{programme.title}</h3>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col justify-center p-6 md:p-10 lg:p-12 ${reverse ? "lg:order-1" : ""}`}
        >
          <div className="hidden items-start gap-4 md:flex">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cams-primary/10">
              <CamsIcon name={programme.listIcon} surface="light" size={36} />
            </div>
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-cams-primary">
                {programme.numberLabel}
              </p>
              <h3 className="mt-1 font-heading text-3xl font-bold leading-tight md:text-4xl">
                {programme.title}
              </h3>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-cams-secondary md:mt-4 md:ml-[4.5rem] md:text-base">
            {programme.tagline}
          </p>
          <ul className="mt-5 space-y-2 text-sm text-cams-slate md:ml-[4.5rem]">
            {programme.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="font-bold text-cams-secondary" aria-hidden>
                  →
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3 md:ml-[4.5rem]">
            <Button href={programme.href} variant="primary" size="lg">
              Full programme detail
            </Button>
            <Button href="/packages" variant="secondary" size="lg">
              See packages
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
