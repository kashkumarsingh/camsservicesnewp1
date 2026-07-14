import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { ROUTES } from '@/shared/utils/routes';
import type { PractitionerProfile } from '@/marketing/content/practitioners/types';

type PractitionerSeoIntroProps = {
  profile: PractitionerProfile;
};

/** Crawlable practitioner SEO copy. */
export function PractitionerSeoIntro({ profile }: PractitionerSeoIntroProps): ReactElement {
  return (
    <PageSeoProse
      eyebrow="Practitioner profile"
      title={`${profile.name}, ${profile.role} at ${profile.company}`}
      titleAs="h2"
      headingId={`practitioner-seo-${profile.slug}`}
      paragraphs={[
        `${profile.name} is ${profile.role} of ${profile.company}, delivering one-to-one mentoring, chaperone services, SEND support and safeguarding-led child transport for families, schools and local authorities.`,
        'All enquiries and bookings are handled through CAMS Services Ltd. Practitioner personal telephone numbers are not displayed on this profile.',
        profile.heroSubtitle,
      ]}
      links={[
        { href: ROUTES.CONTACT, label: 'contact CAMS Services' },
        { href: ROUTES.REFERRAL, label: 'make a referral' },
        { href: ROUTES.AREAS, label: 'service areas' },
        { href: ROUTES.SERVICES, label: 'CAMS programmes' },
      ]}
    />
  );
}
