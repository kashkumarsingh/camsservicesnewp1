import type { ReactElement } from 'react';
import Link from 'next/link';
import {
  getPriorityBoroughLinks,
  getPriorityServiceLocationLinks,
} from '@/marketing/content/locations/area-index-links';
import { PAGE_LAYOUT } from '@/marketing/components/shared/page-layout';
import { ROUTES } from '@/shared/utils/routes';

const BOROUGH_LINKS = getPriorityBoroughLinks();
const PROGRAMME_LINKS = getPriorityServiceLocationLinks().slice(0, 12);

export function HomeAreasLinksSection(): ReactElement {
  return (
    <section className="border-b border-slate-200/80 bg-cams-soft/40 px-4 py-16 md:py-20">
      <div className={PAGE_LAYOUT.container}>
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">Coverage</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-cams-ink md:text-4xl">
            Chaperone and mentoring by borough
          </h2>
          <p className="mt-4 text-base leading-8 text-cams-ink-secondary">
            Borough hubs and local programme pages for West London, Essex and Hertfordshire. Each link opens
            safeguarding-led provision commissioned through CAMS Services Ltd.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-heading text-lg font-bold text-cams-ink">Borough hubs</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {BOROUGH_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-cams-primary shadow-sm transition hover:border-cams-primary/40"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ROUTES.AREAS}
                  className="inline-flex rounded-full border border-cams-primary/30 bg-cams-primary/10 px-3 py-1.5 text-sm font-semibold text-cams-primary"
                >
                  All areas →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold text-cams-ink">Local programmes</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PROGRAMME_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm font-medium text-cams-ink-secondary transition hover:border-cams-primary/30 hover:text-cams-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
