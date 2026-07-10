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

/** Crawlable location SEO copy for "chaperone service [place]" and "chaperoning services [place]". */
export function AreaSeoIntro({ area }: AreaSeoIntroProps): ReactElement {
  return (
    <div className="sr-only">
      <PageSeoProse
        titleAs="h2"
        headingId={`area-seo-${area.slug}`}
        title={areaHeroTitle(area)}
        paragraphs={areaSeoIntroParagraphs(area)}
        links={[
          { href: ROUTES.CHAPERONE_SERVICES, label: 'chaperone services UK' },
          { href: ROUTES.SERVICE_BY_SLUG('community'), label: 'community transport programme' },
          { href: ROUTES.REFERRAL, label: 'make a referral' },
        ]}
      />
    </div>
  );
}
