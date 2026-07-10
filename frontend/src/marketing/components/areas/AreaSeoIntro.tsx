import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import {
  areaHeroTitle,
  areaSeoIntroParagraphs,
} from '@/marketing/content/locations/location-seo-copy';
import type { LocationArea } from '@/marketing/content/locations/types';
import { ROUTES } from '@/shared/utils/routes';

type AreaSeoIntroProps = {
  area: LocationArea;
};

/** Crawlable location SEO copy for all programmes in this borough. */
export function AreaSeoIntro({ area }: AreaSeoIntroProps): ReactElement {
  return (
    <div className="sr-only">
      <PageSeoProse
        titleAs="h2"
        headingId={`area-seo-${area.slug}`}
        title={areaHeroTitle(area.name)}
        paragraphs={areaSeoIntroParagraphs(area)}
        links={[
          { href: ROUTES.CHAPERONE_SERVICES, label: 'chaperone services UK' },
          { href: ROUTES.SERVICE_BY_SLUG('community'), label: 'chaperone & child transport' },
          { href: ROUTES.SERVICE_BY_SLUG('mentoring'), label: 'youth mentoring' },
          { href: ROUTES.SERVICE_BY_SLUG('sen'), label: 'SEND support services' },
          { href: ROUTES.SERVICE_BY_SLUG('routine'), label: 'family support services' },
          { href: ROUTES.SERVICE_BY_SLUG('goals'), label: 'behaviour support' },
          { href: ROUTES.REFERRAL, label: 'make a referral' },
        ]}
      />
    </div>
  );
}
