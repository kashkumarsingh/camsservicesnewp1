import type { ReactElement } from "react";
import Link from "next/link";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import {
  TRANSPORT_SUPPORT_FOOTNOTE,
  TRANSPORT_SUPPORT_INTRO,
  TRANSPORT_SUPPORT_ITEMS,
} from "@/marketing/mock/cams-services-catalog";

export function HomeTransportSupportSection(): ReactElement {
  return (
    <section
      className="relative overflow-hidden bg-white px-4 py-20 md:py-28"
      aria-labelledby="home-transport-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-cams-secondary/[0.08] blur-3xl"
        aria-hidden
      />
      <div className={PAGE_LAYOUT.container}>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <header className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
              Specialist transport
            </p>
            <h2
              id="home-transport-heading"
              className="mt-4 font-heading text-3xl font-bold tracking-tight text-cams-ink md:text-5xl"
            >
              Specialist Transport and{" "}
              <span className="text-cams-primary">Chaperone Services</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cams-ink-secondary">{TRANSPORT_SUPPORT_INTRO}</p>
            <p className="mt-6 text-sm leading-relaxed text-cams-ink-secondary">{TRANSPORT_SUPPORT_FOOTNOTE}</p>
            <Link
              href="/services"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cams-primary transition hover:text-cams-secondary"
            >
              View all services
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </header>

          <div className="lg:col-span-7">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-cams-ink-secondary">
              Support may include
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {TRANSPORT_SUPPORT_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-cams-soft/40 p-4 transition hover:border-cams-primary/25 hover:bg-white hover:shadow-sm"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-cams-primary/20 bg-white">
                    <CamsIcon name="mapPin" surface="muted" size={18} />
                  </span>
                  <span className="text-sm font-semibold leading-relaxed text-cams-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
