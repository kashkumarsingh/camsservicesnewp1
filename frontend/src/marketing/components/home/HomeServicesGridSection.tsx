import type { ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/marketing/components/ui/button";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { CAMS_SERVICES_LIST } from "@/marketing/mock/cams-services-catalog";

export function HomeServicesGridSection(): ReactElement {
  return (
    <section className="relative overflow-hidden bg-cams-soft px-4 py-20 md:py-28">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-cams-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-[1600px]">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">Our services</p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-cams-ink md:text-5xl">
            Tailored support across transport, mentoring, and care
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-cams-ink-secondary">
            From chaperone and transport services to mentoring, SEND support, and tailored one-to-one packages — all
            designed around individual needs, circumstances, and goals.
          </p>
        </header>

        <div className="mt-12 w-full">
          <ul
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Our services"
          >
            {CAMS_SERVICES_LIST.map((service) => (
              <li key={service}>
                <Link
                  href="/services"
                  className="group flex h-full min-h-[4.5rem] items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cams-primary/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cams-primary"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 sm:size-10">
                    <CamsIcon name="heartHandshake" surface="muted" size={18} />
                  </span>
                  <span className="min-w-0 flex-1 font-heading text-sm font-bold text-cams-ink group-hover:text-cams-primary sm:text-base">
                    {service}
                  </span>
                  <span className="shrink-0 text-cams-primary transition group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button href="/services" variant="secondary">
              Full services overview
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
