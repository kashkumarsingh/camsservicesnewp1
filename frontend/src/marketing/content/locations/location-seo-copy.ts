import type { LocationArea, LocationAreaFaq } from '@/marketing/content/locations/types';

/** How people search: "chaperone service Ealing", "chaperoning services Hounslow", etc. */
export function areaMetaTitle(area: Pick<LocationArea, 'name'>): string {
  return `Chaperone service ${area.name} | Chaperoning services ${area.name}`;
}

export function areaMetaDescription(
  area: Pick<LocationArea, 'name' | 'keyAreas' | 'isHeadquarters'>
): string {
  const places = area.keyAreas.slice(0, 4).join(', ');
  const hq = area.isHeadquarters ? ' HQ Greenford.' : '';
  return `Chaperone service and chaperoning services in ${area.name} (${places}). DBS-checked child chaperones for schools, IFAs and local authorities.${hq} CAMS services.`;
}

export function areaHeroTitle(area: Pick<LocationArea, 'name'>): string {
  return `Chaperone service & chaperoning services in ${area.name}`;
}

export function areaHeroDescription(
  area: Pick<LocationArea, 'name' | 'heroDescription'>
): string {
  return area.heroDescription;
}

export function areaFocusKeywords(area: Pick<LocationArea, 'name'>): readonly string[] {
  const n = area.name;
  return [
    `chaperone service ${n}`,
    `chaperone services ${n}`,
    `chaperoning services ${n}`,
    `chaperoning service ${n}`,
    `chaperone service near ${n}`,
  ];
}

export function buildAreaLocationFaq(
  area: Pick<LocationArea, 'name' | 'keyAreas'>,
  keyAreaSample: string
): readonly LocationAreaFaq[] {
  const { name } = area;
  return [
    {
      q: `Do you provide chaperone service in ${name}?`,
      a: `Yes. CAMS services delivers chaperone service in ${name} for children and young people who need supervised travel. This includes contact centre transport, school runs, foster placement journeys and community access across ${keyAreaSample} and wider ${name}.`,
    },
    {
      q: `Are chaperoning services available in ${name}?`,
      a: `Yes. Our chaperoning services in ${name} are the same safeguarding-led provision: DBS-checked practitioners, planned handovers and de-escalation support. Commissioners use "chaperoning services" and "chaperone service" interchangeably in care plans and contracts.`,
    },
    {
      q: `Who can refer for chaperone service near ${name}?`,
      a: `Local authorities, schools, SENCOs, foster agencies, IFAs and parents can refer for chaperone service near ${name}. Share postcodes, schedules and safeguarding context via our referral form or contact page.`,
    },
    {
      q: `Which neighbourhoods in ${name} do you cover?`,
      a: `We plan journeys across ${name} including ${area.keyAreas.slice(0, 5).join(', ')}. School runs, contact centre slots and foster moves are routed with realistic travel time and clear handover points.`,
    },
    {
      q: `How quickly can chaperoning services start in ${name}?`,
      a: `Urgent contact or placement moves are often scoped within one working day. Provide court dates, contact windows and behaviour notes when you refer so we can confirm practitioner cover in ${name}.`,
    },
  ];
}

export function mergeAreaFaq(
  area: LocationArea,
  keyAreaSample: string
): readonly LocationAreaFaq[] {
  const locationFaq = buildAreaLocationFaq(area, keyAreaSample);
  const existing = area.faq.filter(
    (item) => !locationFaq.some((loc) => loc.q === item.q)
  );
  return [...locationFaq, ...existing];
}

export function areaSeoIntroParagraphs(area: LocationArea): readonly string[] {
  const neighbourhoods = area.keyAreas.join(', ');
  return [
    `Search for chaperone service ${area.name}, chaperoning services ${area.name}, or chaperone service near ${area.name}? CAMS services Ltd provides safeguarding-first child escort and transport across ${area.name} and ${neighbourhoods}.`,
    `Our chaperone service in ${area.name} is person-centred: the same practitioner can support multiple journeys each week when continuity helps the child. Chaperoning services include supervised contact transport, SEMH-friendly school runs and foster placement moves — not medical or entertainment chaperoning.`,
    `Schools, children's services teams and foster agencies in ${area.name} commission CAMS when independent travel is unsafe or court-ordered contact requires a trained adult. Submit a referral with postcodes and handover instructions to confirm cover.`,
  ];
}
