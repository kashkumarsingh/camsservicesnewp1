import type { ReactElement } from 'react';
import { CamsIcon } from '@/marketing/components/shared/CamsIcon';
import { MarketingSeoOverviewPanel } from '@/marketing/components/shared/MarketingSeoOverviewPanel';
import { getServiceSeoCopy } from '@/marketing/content/service-seo-copy';
import type { ServiceProgrammeListItem } from '@/marketing/mock/services-programmes';
import { ROUTES } from '@/shared/utils/routes';

type ServiceSeoOverviewProps = {
  programme: ServiceProgrammeListItem;
  className?: string;
};

/** Crawlable service detail copy with CAMS marketing layout. */
export function ServiceSeoOverview({ programme, className }: ServiceSeoOverviewProps): ReactElement {
  const copy = getServiceSeoCopy(programme);

  return (
    <MarketingSeoOverviewPanel
      className={className}
      eyebrow="Programme overview"
      title={`About ${programme.title}`}
      headingId="service-seo-heading"
      paragraphs={[copy.overview, copy.delivery]}
      blocks={[
        {
          title: 'What this programme includes',
          content: (
            <>
              <p>{copy.featuresIntro}</p>
              <ul className="mt-4 space-y-2">
                {programme.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex shrink-0 rounded-lg border border-cams-primary/15 bg-cams-primary/[0.08] p-1">
                      <CamsIcon name="listChecks" size={14} strokeWidth={2.5} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </>
          ),
        },
        {
          title: 'Commissioning with CAMS services',
          content: <p>{copy.commissioning}</p>,
        },
      ]}
      links={[
        { href: ROUTES.PACKAGES, label: 'Intervention packages' },
        { href: ROUTES.REFERRAL, label: 'Make a referral' },
        { href: ROUTES.CONTACT, label: 'Contact the team' },
      ]}
    />
  );
}
