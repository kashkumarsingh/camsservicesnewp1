import type { NavMegaColumn } from '@/mock/navigation';
import { LOCATION_AREAS } from '@/marketing/content/locations/areas';
import { ROUTES } from '@/shared/utils/routes';

const WEST_LONDON_NAV_SLUGS = [
  'ealing',
  'hounslow',
  'hillingdon',
  'brent',
  'harrow',
  'hammersmith-and-fulham',
  'richmond-upon-thames',
  'kensington-and-chelsea',
] as const;

const NORTH_AND_COUNTIES_NAV_SLUGS = [
  'barnet',
  'enfield',
  'watford',
  'hertsmere',
  'slough',
] as const;

const bySlug = new Map(LOCATION_AREAS.map((area) => [area.slug, area]));

function toNavLink(slug: string) {
  const area = bySlug.get(slug);
  if (!area) return null;
  const label = area.isHeadquarters ? `${area.name} (HQ Greenford)` : area.name;
  return {
    href: ROUTES.AREA_BY_SLUG(area.slug),
    label,
    description: area.keyAreas.slice(0, 3).join(', '),
  };
}

export function buildAreasNavColumns(): readonly NavMegaColumn[] {
  const westLinks = WEST_LONDON_NAV_SLUGS.map(toNavLink).filter((link) => link != null);
  const northLinks = NORTH_AND_COUNTIES_NAV_SLUGS.map(toNavLink).filter((link) => link != null);

  return [
    {
      heading: 'West London',
      links: [
        {
          href: ROUTES.AREAS,
          label: 'All service areas',
          description: 'Borough and county coverage from Greenford HQ.',
        },
        ...westLinks,
      ],
    },
    {
      heading: 'North & counties',
      links: northLinks,
    },
  ];
}
