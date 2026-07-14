import type { NavMegaColumn } from '@/mock/navigation';
import { PRACTITIONER_PROFILES } from '@/marketing/content/practitioners';
import { ROUTES } from '@/shared/utils/routes';

export function buildPractitionersNavColumns(): readonly NavMegaColumn[] {
  const links = PRACTITIONER_PROFILES.map((profile) => ({
    href: ROUTES.PRACTITIONER_BY_SLUG(profile.slug),
    label: profile.name,
    description: `${profile.role}. ${profile.servicesSummary.slice(0, 3).join(', ')}.`,
  }));

  return [
    {
      heading: 'Practitioner profiles',
      links,
    },
  ];
}

export function getPrimaryPractitionerNavHref(): string {
  const first = PRACTITIONER_PROFILES[0];
  return first ? ROUTES.PRACTITIONER_BY_SLUG(first.slug) : ROUTES.CONTACT;
}
