import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { getBorderingAreas } from '@/marketing/content/locations';
import type { ServiceLocationPageContent } from '@/marketing/content/locations/service-location-page-content';
import type { LocationArea } from '@/marketing/content/locations/types';
import { getServiceProgrammeBySlug } from '@/marketing/mock/services-programmes';
import { ROUTES } from '@/shared/utils/routes';

type ServiceLocationSeoIntroProps = {
  area: LocationArea;
  serviceSlug: string;
  content: ServiceLocationPageContent;
};

/** Extra crawlable copy for service × location URLs. */
export function ServiceLocationSeoIntro({
  area,
  serviceSlug,
  content,
}: ServiceLocationSeoIntroProps): ReactElement {
  const programme = getServiceProgrammeBySlug(serviceSlug);
  const neighbours = getBorderingAreas(area)
    .slice(0, 4)
    .map((item) => item.name)
    .join(', ');
  const neighbourhoods = area.keyAreas.join(', ');

  return (
    <div className="sr-only">
      <PageSeoProse
        titleAs="h2"
        headingId={`service-location-seo-${area.slug}-${serviceSlug}`}
        title={content.heroTitle}
        paragraphs={[
          `${content.heroSubtitle} CAMS services Ltd commissions one-to-one ${programme?.title.toLowerCase() ?? 'support'} in ${area.name} for schools, IFAs, virtual schools and children's services teams.`,
          `Neighbourhoods we plan around in ${area.name} include ${neighbourhoods}. ${area.notes}`,
          neighbours
            ? `We also support bordering areas including ${neighbours} when placements, schools or contact centres cross borough lines.`
            : `Refer with postcodes so we can confirm routing and practitioner availability in ${area.name}.`,
          `National programme detail: ${programme?.description ?? content.metaDescription}`,
        ]}
        links={[
          { href: ROUTES.AREA_BY_SLUG(area.slug), label: `${area.name} borough hub` },
          { href: ROUTES.SERVICE_BY_SLUG(serviceSlug), label: programme?.title ?? 'programme detail' },
          { href: ROUTES.AREAS, label: 'all service areas' },
          { href: ROUTES.REFERRAL, label: 'make a referral' },
        ]}
      />
    </div>
  );
}
