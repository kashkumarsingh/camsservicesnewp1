import type { ReactElement } from 'react';
import Link from 'next/link';
import { SERVICE_LOCATION_KEYWORDS } from '@/marketing/content/locations/service-location-keywords';
import type { LocationArea } from '@/marketing/content/locations/types';
import { PAGE_LAYOUT } from '@/marketing/components/shared/page-layout';

type AreaServicesKeywordsSectionProps = {
  area: LocationArea;
};

/** Visible local SEO grid: every programme × location search phrases. */
export function AreaServicesKeywordsSection({ area }: AreaServicesKeywordsSectionProps): ReactElement {
  return (
    <section className={`${PAGE_LAYOUT.panel} p-5 sm:p-6 md:p-10`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">
        Services in {area.name}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
        What we <span className="text-cams-primary">deliver</span> locally
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-cams-ink-secondary md:text-base">
        CAMS area pages cover all our programmes — not only chaperone service. Commissioners and families
        search for different keywords; each programme below links to full detail.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {SERVICE_LOCATION_KEYWORDS.map((service) => (
          <li
            key={service.slug}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
          >
            <Link
              href={service.servicePath}
              className="font-heading text-base font-bold text-cams-ink no-underline hover:text-cams-primary"
            >
              {service.label}
            </Link>
            <p className="mt-2 text-xs font-medium text-cams-slate">
              In {area.name}:{' '}
              {service.searchPhrases
                .slice(0, 3)
                .map((phrase) => `${phrase} ${area.name}`)
                .join(' · ')}
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-cams-primary">
              View programme →
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
