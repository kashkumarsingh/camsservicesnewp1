/**
 * Phase 6 geography expansion — Essex, Hertfordshire beyond Watford, and London boroughs
 * bordering the core West/North commissioning ring (Ealing, Harrow, Brent, Hillingdon, Barnet, Hounslow).
 *
 * Rollout order (from locationUtils region map):
 * 1. Essex (CM / SS / CO postcodes — already referenced in site copy)
 * 2. Hertfordshire towns beyond Watford (AL / HP / SG / WD)
 * 3. Remaining Greater London boroughs bordering the core six
 */
import type { LocationArea } from '@/marketing/content/locations/types';
import { createLocationArea } from '@/marketing/content/locations/area-factory';

/** Tier 1 — Essex */
const PHASE6_ESSEX_AREAS: readonly LocationArea[] = [
  createLocationArea({
    slug: 'chelmsford',
    name: 'Chelmsford',
    councilType: 'county-town',
    councilTypeLabel: 'Essex (city)',
    region: 'Essex',
    regionSlug: 'essex',
    keyAreas: ['Chelmsford', 'Great Baddow', 'Writtle', 'Springfield', 'Moulsham'],
    notes: 'Essex county town; strong LA and school commissioning routes from East London and West Essex.',
    borderingSlugs: ['brentwood', 'harlow', 'colchester', 'basildon'],
    expansionTier: 'phase6-essex',
    faqSample: 'central Chelmsford',
    metaTitle: 'Chaperone services Chelmsford | Child transport Essex',
    metaDescription:
      'Chaperone services in Chelmsford and mid Essex. Child transport, school runs, mentoring and SEND support for schools, IFAs and families.',
    heroDescription:
      'Chaperone services and child transport across Chelmsford, Great Baddow and mid Essex, linked to West London commissioning routes.',
    paragraphs: [
      'Chelmsford is the administrative heart of Essex and a natural Phase 6 hub for CAMS services when commissioners need county-wide safeguarding standards with links into West London placement networks.',
      'Schools, IFAs and Essex children\'s services teams commission chaperone services for SEMH school transport, contact centre journeys and mentoring when attendance or placement stability is at risk.',
      'Share postcodes for Great Baddow, Writtle or Springfield at referral so we can plan cross-county timing with bordering Harlow, Brentwood or Colchester cases.',
    ],
  }),
  createLocationArea({
    slug: 'brentwood',
    name: 'Brentwood',
    councilType: 'county-town',
    councilTypeLabel: 'Essex (town)',
    region: 'Essex',
    regionSlug: 'essex',
    keyAreas: ['Brentwood', 'Hutton', 'Shenfield', 'Ingatestone', 'Pilgrims Hatch'],
    notes: 'West Essex border with Havering and East London corridors; popular for school and foster referrals.',
    borderingSlugs: ['chelmsford', 'basildon', 'harlow', 'enfield'],
    expansionTier: 'phase6-essex',
    faqSample: 'Shenfield',
    paragraphs: [
      'Brentwood sits on the western Essex edge with strong travel links toward London and mid Essex. CAMS services delivers chaperone services when children need supervised transport between home, school and contact centres.',
      'Shenfield and Hutton referrals often involve SEMH-friendly school runs or mentoring aligned with pastoral plans. We document factual journey notes where commissioned.',
      'Cases may cross toward Enfield or Havering edges. Include court orders and bell times at referral so routing from our Greenford HQ stays realistic.',
    ],
  }),
  createLocationArea({
    slug: 'basildon',
    name: 'Basildon',
    councilType: 'county-town',
    councilTypeLabel: 'Essex (town)',
    region: 'Essex',
    regionSlug: 'essex',
    keyAreas: ['Basildon', 'Pitsea', 'Laindon', 'Vange', 'Wickford'],
    notes: 'South Essex hub with high SEND and fostering volume toward Thurrock and Southend corridors.',
    borderingSlugs: ['brentwood', 'chelmsford'],
    expansionTier: 'phase6-essex',
    faqSample: 'Pitsea',
    paragraphs: [
      'Basildon and Pitsea generate steady demand for school transport support and youth mentoring when mainstream arrangements cannot keep children safe on the journey.',
      'CAMS services scopes chaperone service hours with risk assessments, defined handovers and optional mentoring through intervention packages where commissioners want joined-up weeks.',
      'South Essex placements sometimes connect to West London schools. Tell us when journeys terminate in Greater London so we can align practitioners with bordering borough pages.',
    ],
  }),
  createLocationArea({
    slug: 'harlow',
    name: 'Harlow',
    councilType: 'county-town',
    councilTypeLabel: 'Essex (town)',
    region: 'Essex',
    regionSlug: 'essex',
    keyAreas: ['Harlow', 'Old Harlow', 'Church Langley', 'Little Parndon', 'Netteswell'],
    notes: 'North Essex new town bordering Hertfordshire and Enfield; common cross-border school and contact routes.',
    borderingSlugs: ['chelmsford', 'enfield', 'hertsmere', 'st-albans'],
    expansionTier: 'phase6-essex',
    faqSample: 'Church Langley',
    paragraphs: [
      'Harlow sits between Essex, Hertfordshire and Enfield, making it a key Phase 6 location for cross-border chaperone services and child transport.',
      'Commissioners in Harlow often need practitioners who can reach both Essex schools and North London contact centres without sacrificing punctuality on court-ordered slots.',
      'Our Greenford operations base gives short access to Harlow corridors. Share placement addresses and contact schedules when you refer.',
    ],
  }),
  createLocationArea({
    slug: 'colchester',
    name: 'Colchester',
    councilType: 'county-town',
    councilTypeLabel: 'Essex (town)',
    region: 'Essex',
    regionSlug: 'essex',
    keyAreas: ['Colchester', 'Stanway', 'Marks Tey', 'Wivenhoe', 'Myland'],
    notes: 'North Essex garrison town with fostering and SEND transport demand across wider Essex.',
    borderingSlugs: ['chelmsford', 'harlow'],
    expansionTier: 'phase6-essex',
    faqSample: 'Stanway',
    paragraphs: [
      'Colchester extends CAMS Essex coverage for commissioners who need trauma-informed chaperone services beyond mid Essex and West London links.',
      'Stanway and Myland school runs may require SEMH-aware escorts when anxiety or care status makes shared transport unsuitable.',
      'Longer Essex journeys are planned with buffer time, backup cover and factual reporting suitable for reviews and proceedings where commissioned.',
    ],
  }),
];

/** Tier 2 — Hertfordshire beyond Watford (Watford and Hertsmere already live). */
const PHASE6_HERTFORDSHIRE_AREAS: readonly LocationArea[] = [
  createLocationArea({
    slug: 'st-albans',
    name: 'St Albans',
    councilType: 'county-town',
    councilTypeLabel: 'Hertfordshire (city)',
    region: 'Hertfordshire',
    regionSlug: 'hertfordshire',
    keyAreas: ['St Albans', 'London Colney', 'Marshalswick', 'Fleetville', 'How Wood'],
    notes: 'Hertfordshire city between Watford, Hertsmere and Barnet corridors.',
    borderingSlugs: ['watford', 'hertsmere', 'barnet', 'hemel-hempstead', 'harlow'],
    expansionTier: 'phase6-hertfordshire',
    faqSample: 'Marshalswick',
    paragraphs: [
      'St Albans connects Hertfordshire schools and foster networks with North London and West London placement routes. CAMS services delivers chaperone services with the same safeguarding standards as our borough hubs.',
      'London Colney and Marshalswick referrals often involve school transport support when SEMH presentations make independent travel unsafe.',
      'Cross-border cases may link to Barnet, Enfield or Harlow. Include EHCP or care plan extracts at referral where travel is named provision.',
    ],
  }),
  createLocationArea({
    slug: 'hemel-hempstead',
    name: 'Hemel Hempstead',
    councilType: 'county-town',
    councilTypeLabel: 'Hertfordshire (town)',
    region: 'Hertfordshire',
    regionSlug: 'hertfordshire',
    keyAreas: ['Hemel Hempstead', 'Adeyfield', 'Bennetts End', 'Boxmoor', 'Gadebridge'],
    notes: 'West Hertfordshire town linked to Watford, St Albans and Harrow travel patterns.',
    borderingSlugs: ['watford', 'st-albans', 'harrow'],
    expansionTier: 'phase6-hertfordshire',
    faqSample: 'Boxmoor',
    paragraphs: [
      'Hemel Hempstead extends Hertfordshire cover west of Watford for chaperone services, mentoring and SEND support commissioned by schools and agencies.',
      'Boxmoor and Adeyfield cases may need consistent adults across transport and mentoring when mornings and after-school sessions should align.',
      'Journeys toward Harrow or North London schools are scoped with realistic drive times from our Greenford HQ and local practitioner availability.',
    ],
  }),
  createLocationArea({
    slug: 'stevenage',
    name: 'Stevenage',
    councilType: 'county-town',
    councilTypeLabel: 'Hertfordshire (town)',
    region: 'Hertfordshire',
    regionSlug: 'hertfordshire',
    keyAreas: ['Stevenage', 'Old Town', 'Bedwell', 'Pin Green', 'Symonds Green'],
    notes: 'North Hertfordshire hub bordering Hertsmere and Barnet edges.',
    borderingSlugs: ['hertsmere', 'barnet', 'st-albans'],
    expansionTier: 'phase6-hertfordshire',
    faqSample: 'Bedwell',
    paragraphs: [
      'Stevenage adds north Hertfordshire depth beyond Watford and Hertsmere for CAMS chaperone service and child transport commissioning.',
      'Bedwell and Pin Green referrals often involve children in care who need neutral contact transport or mentoring after supervised family time.',
      'Share whether journeys connect to Barnet or North London contact centres so handover protocols are agreed before the first session.',
    ],
  }),
];

/** Tier 3 — Greater London boroughs bordering the core six (Ealing, Harrow, Brent, Hillingdon, Barnet, Hounslow). */
const PHASE6_LONDON_BORDER_AREAS: readonly LocationArea[] = [
  createLocationArea({
    slug: 'kingston-upon-thames',
    name: 'Kingston upon Thames',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Kingston', 'Surbiton', 'New Malden', 'Tolworth', 'Chessington'],
    notes: 'Borders Richmond upon Thames; South West London SEND and fostering referrals.',
    borderingSlugs: ['richmond-upon-thames', 'hounslow'],
    expansionTier: 'phase6-london',
    faqSample: 'Surbiton',
    paragraphs: [
      'Kingston upon Thames extends South West London cover from our Richmond and Hounslow corridors for chaperone services and SEMH school transport.',
      'Surbiton and New Malden schools commission dedicated runs when care status or SEMH needs make mainstream transport unsuitable.',
      'Include authorised handover adults and gate contacts at referral so school reception staff expect commissioned transport.',
    ],
  }),
  createLocationArea({
    slug: 'waltham-forest',
    name: 'Waltham Forest',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Walthamstow', 'Leyton', 'Leytonstone', 'Chingford', 'Highams Park'],
    notes: 'Borders Enfield and Redbridge; North East London inclusion and transport demand.',
    borderingSlugs: ['enfield', 'redbridge', 'haringey'],
    expansionTier: 'phase6-london',
    faqSample: 'Walthamstow',
    paragraphs: [
      'Waltham Forest connects Enfield and Redbridge commissioning routes for CAMS chaperone services, mentoring and family support.',
      'Leyton and Walthamstow referrals often involve SEMH barriers to attendance where a trusted adult on the school run protects mornings.',
      'Cross-border journeys toward Essex or Hertfordshire edges should include full postcodes and bell times at referral.',
    ],
  }),
  createLocationArea({
    slug: 'haringey',
    name: 'Haringey',
    councilType: 'inner-london-borough',
    councilTypeLabel: 'Inner London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Tottenham', 'Wood Green', 'Hornsey', 'Crouch End', 'Highgate'],
    notes: 'Borders Barnet and Enfield; high SEMH and SEND school transport volume.',
    borderingSlugs: ['barnet', 'enfield', 'waltham-forest'],
    expansionTier: 'phase6-london',
    faqSample: 'Tottenham',
    paragraphs: [
      'Haringey sits between Barnet and Enfield, extending North London chaperone service cover for schools, virtual schools and IFAs.',
      'Tottenham and Wood Green cases may need transport plus mentoring when contact weekends or placement moves affect Monday attendance.',
      'Commissioners should share risk assessments and prohibited contact persons before the first chaperone journey.',
    ],
  }),
  createLocationArea({
    slug: 'redbridge',
    name: 'Redbridge',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Ilford', 'Woodford', 'South Woodford', 'Barkingside', 'Gants Hill'],
    notes: 'Borders Waltham Forest; Essex/London corridor for school and contact transport.',
    borderingSlugs: ['waltham-forest', 'enfield', 'brentwood'],
    expansionTier: 'phase6-london',
    faqSample: 'Ilford',
    paragraphs: [
      'Redbridge completes North East London coverage alongside Enfield and Waltham Forest for CAMS chaperone services and child transport.',
      'Ilford and Woodford referrals often cross toward Essex edges or mid Essex schools. Plan journeys with explicit handover locations indoors where possible.',
      'Our team confirms feasibility within one working day when you refer with schedule, behaviour notes and court dates.',
    ],
  }),
];

export const PHASE6_LOCATION_AREAS: readonly LocationArea[] = [
  ...PHASE6_ESSEX_AREAS,
  ...PHASE6_HERTFORDSHIRE_AREAS,
  ...PHASE6_LONDON_BORDER_AREAS,
];

export const PHASE6_EXPANSION_ORDER = [
  { tier: 'phase6-essex', label: 'Essex', slugs: PHASE6_ESSEX_AREAS.map((a) => a.slug) },
  {
    tier: 'phase6-hertfordshire',
    label: 'Hertfordshire (beyond Watford)',
    slugs: PHASE6_HERTFORDSHIRE_AREAS.map((a) => a.slug),
  },
  {
    tier: 'phase6-london',
    label: 'London boroughs bordering core six',
    slugs: PHASE6_LONDON_BORDER_AREAS.map((a) => a.slug),
  },
] as const;
