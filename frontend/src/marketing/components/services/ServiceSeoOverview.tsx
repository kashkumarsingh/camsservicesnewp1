import type { ReactElement } from 'react';
import Link from 'next/link';
import { getServiceSeoCopy } from '@/marketing/content/service-seo-copy';
import type { ServiceProgrammeListItem } from '@/marketing/mock/services-programmes';
import { ROUTES } from '@/shared/utils/routes';

type ServiceSeoOverviewProps = {
  programme: ServiceProgrammeListItem;
};

/** Crawlable service detail copy (Semrush text-HTML ratio). */
export function ServiceSeoOverview({ programme }: ServiceSeoOverviewProps): ReactElement {
  const copy = getServiceSeoCopy(programme);

  return (
    <section className="border-b border-primary-blue/10 bg-white py-12" aria-labelledby="service-seo-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="service-seo-heading" className="font-heading text-2xl font-bold text-navy-blue md:text-3xl">
          About {programme.title} at CAMS Services
        </h2>
        <p className="mt-4 text-base leading-7 text-navy-blue/85">{copy.overview}</p>
        <p className="mt-4 text-base leading-7 text-navy-blue/85">{copy.delivery}</p>
        <h3 className="mt-8 text-lg font-bold text-navy-blue">What this programme includes</h3>
        <p className="mt-3 text-base leading-7 text-navy-blue/85">{copy.featuresIntro}</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-7 text-navy-blue/85">
          {programme.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <h3 className="mt-8 text-lg font-bold text-navy-blue">Commissioning with CAMS Services</h3>
        <p className="mt-3 text-base leading-7 text-navy-blue/85">{copy.commissioning}</p>
        <p className="mt-6 text-sm leading-6 text-navy-blue/75">
          Explore{' '}
          <Link href={ROUTES.PACKAGES} className="font-semibold text-primary-blue underline underline-offset-2">
            intervention packages
          </Link>
          ,{' '}
          <Link href={ROUTES.REFERRAL} className="font-semibold text-primary-blue underline underline-offset-2">
            make a referral
          </Link>
          , or{' '}
          <Link href={ROUTES.CONTACT} className="font-semibold text-primary-blue underline underline-offset-2">
            contact CAMS Services
          </Link>{' '}
          about {programme.title}.
        </p>
      </div>
    </section>
  );
}
