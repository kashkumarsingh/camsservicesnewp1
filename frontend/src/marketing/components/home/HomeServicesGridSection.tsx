import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/marketing/components/ui/button";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { PROGRAMME_COVER_IMAGE_LAYOUT } from "@/marketing/constants/programmeCoverImageLayout";
import { HOME_SERVICE_PROGRAMMES } from "@/marketing/mock/home-services";

export function HomeServicesGridSection(): ReactElement {
  const { width: thumbW, height: thumbH } = PROGRAMME_COVER_IMAGE_LAYOUT.homeThumb;

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
            Programmes you can mix, match, and scale
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-cams-ink-secondary">
            All programmes are delivered on a one-to-one basis, tailored to each young person with clear structure,
            consistency and safeguarding throughout
          </p>
        </header>

        <div className="mt-12 w-full">
          <h3 className="font-heading text-sm font-bold uppercase tracking-[0.18em] text-cams-ink-secondary">
            Programmes
          </h3>
          <ul
            className="mt-4 grid grid-cols-2 gap-3 max-sm:gap-2"
            aria-label="Programmes, each links to a service page"
          >
            {HOME_SERVICE_PROGRAMMES.map((programme) => (
              <li key={programme.href} className="min-h-0">
                <Link
                  href={programme.href}
                  className="group flex h-full min-h-[4.5rem] items-stretch overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cams-primary/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cams-primary"
                >
                  <div
                    className="relative w-[4.75rem] shrink-0 overflow-hidden sm:w-[6.5rem] md:w-[7.5rem]"
                    aria-hidden
                  >
                    <Image
                      src={programme.image}
                      alt=""
                      width={thumbW}
                      height={thumbH}
                      sizes="(max-width: 640px) 25vw, 120px"
                      className="h-full min-h-[4.5rem] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cams-dark/25 to-transparent" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2 p-3 sm:gap-3 sm:p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 sm:size-11">
                      <CamsIcon name={programme.icon} surface="muted" size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading text-sm font-bold text-cams-ink group-hover:text-cams-primary sm:text-base md:text-lg">
                        {programme.title}
                      </span>
                      <p className="mt-1 text-xs leading-relaxed text-cams-ink-secondary sm:text-sm">
                        {programme.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-cams-primary transition group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button href="/services" variant="secondary">
              All services overview
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
