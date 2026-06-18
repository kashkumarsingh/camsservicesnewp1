import type { ReactElement } from "react";
import { Button } from "@/marketing/components/ui/button";
import { MarketingBulletGrid } from "@/marketing/components/shared/MarketingBulletGrid";
import { MarketingSectionHeader } from "@/marketing/components/shared/MarketingSectionHeader";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import { CAMS_SERVICES_LIST } from "@/marketing/mock/cams-services-catalog";

export function HomeServicesGridSection(): ReactElement {
  return (
    <section className={PAGE_LAYOUT.homeSectionSoft} aria-labelledby="home-services-heading">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-cams-primary/10 blur-3xl"
        aria-hidden
      />

      <div className={PAGE_LAYOUT.homeContainer}>
        <MarketingSectionHeader
          id="home-services-heading"
          eyebrow="Our services"
          title={
            <>
              Tailored support across{" "}
              <span className="bg-gradient-to-r from-cams-primary to-cams-secondary bg-clip-text text-transparent">
                transport, mentoring, and care
              </span>
            </>
          }
          description="From chaperone and transport services to mentoring, SEND support, and tailored one-to-one packages, all designed around individual needs, circumstances, and goals."
        />

        <div className="mt-10 w-full md:mt-12">
          <MarketingBulletGrid
            items={CAMS_SERVICES_LIST}
            icon="heartHandshake"
            href="/services"
            columnsClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/services" variant="secondary" className="w-full sm:w-auto">
              Full services overview
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
