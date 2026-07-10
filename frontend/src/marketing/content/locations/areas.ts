import type { LocationArea } from '@/marketing/content/locations/types';

const CORE_SERVICE_SLUGS = [
  'community',
  'mentoring',
  'sen',
  'routine',
  'goals',
  'sports-support-programme',
] as const;

function areaFaq(placeName: string, keyAreaSample: string): LocationArea['faq'] {
  return [
    {
      q: `Do you provide chaperone services in ${placeName}?`,
      a: `Yes. CAMS services delivers chaperone services, child transport and mentoring across ${placeName} for local authorities, schools, foster agencies and families. Contact us to discuss availability in ${keyAreaSample} and surrounding neighbourhoods.`,
    },
    {
      q: `Which neighbourhoods in ${placeName} do you cover?`,
      a: `We plan journeys across the borough or town based on referrer need, including school runs, contact centre transport, foster moves and community access. Share postcodes when you refer so we can confirm routing and practitioner cover.`,
    },
    {
      q: `How do schools and local authorities refer in ${placeName}?`,
      a: `Use our online referral form or contact page. We respond within one working day with feasibility, safeguarding questions and recommended next steps.`,
    },
  ];
}

export const LOCATION_AREAS: readonly LocationArea[] = [
  {
    slug: 'ealing',
    name: 'Ealing',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Ealing', 'Acton', 'Southall', 'Greenford', 'Hanwell', 'Perivale'],
    notes: 'CAMS services HQ is in Greenford, Ealing, our anchor borough for West London chaperone and transport cover.',
    borderingSlugs: ['hillingdon', 'hounslow', 'brent', 'harrow'],
    isHeadquarters: true,
    focusKeyword: 'chaperone services Ealing',
    metaTitle: 'Chaperone services Ealing | Child transport Greenford & West London',
    metaDescription:
      'Chaperone services and child transport in Ealing, Acton, Southall, Greenford and Hanwell. CAMS services Ltd, HQ in Greenford. DBS-checked practitioners for schools and local authorities.',
    heroDescription:
      'Chaperone services, school transport and mentoring from our Greenford base across Ealing, Acton, Southall, Hanwell and Perivale.',
    paragraphs: [
      'CAMS services is headquartered in Greenford, Ealing. Commissioners and families across the borough benefit from short routing times, familiar practitioners and consistent cover for contact centre journeys, SEMH-friendly school runs and foster placement transport.',
      'Ealing is one of West London’s most diverse boroughs. We work with schools, nurseries, IFAs and children’s services teams who need reliable chaperone service cover when relationships are high-conflict, when SEND transport plans require trauma-informed staff, or when a young person needs the same escort each week.',
      'Neighbourhoods we plan for regularly include Acton, Southall, Hanwell, Perivale and Northolt. If your case involves handovers near busy transport hubs or tight contact centre slots, include court or contact plan times in your referral so we can prioritise feasibility.',
    ],
    faq: areaFaq('Ealing', 'Greenford'),
    serviceSlugs: CORE_SERVICE_SLUGS,
  },
  {
    slug: 'harrow',
    name: 'Harrow',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Harrow', 'Wealdstone', 'Pinner', 'Stanmore', 'Kenton'],
    notes: 'Borders Brent, Barnet and Hillingdon, with strong school and family referral routes from North West London.',
    borderingSlugs: ['brent', 'barnet', 'hillingdon', 'ealing'],
    focusKeyword: 'chaperone services Harrow',
    metaTitle: 'Chaperone services Harrow | Child transport Pinner & Stanmore',
    metaDescription:
      'Chaperone services and child transport in Harrow, Wealdstone, Pinner, Stanmore and Kenton. Safeguarding-led cover for schools, foster agencies and local authorities.',
    heroDescription:
      'Chaperone services and mentoring across Harrow, Wealdstone, Pinner, Stanmore and Kenton with practitioners who understand North West London travel patterns.',
    paragraphs: [
      'Harrow combines dense town centres with quieter residential streets towards Pinner and Stanmore. CAMS services plans chaperone service routes that respect school bell times, contact centre windows and placement geography across the borough.',
      'Referrers in Harrow often need joined-up transport when a young person moves between home, school and supervised contact. We document factual journey summaries for professionals and keep the same practitioner where consistency supports safeguarding.',
      'We also cover Kenton and Wealdstone with links into neighbouring Brent and Barnet when cases cross borough boundaries. Share full postcodes at referral so handovers stay unambiguous.',
    ],
    faq: areaFaq('Harrow', 'Pinner'),
    serviceSlugs: CORE_SERVICE_SLUGS,
  },
  {
    slug: 'brent',
    name: 'Brent',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Wembley', 'Willesden', 'Kingsbury', 'Harlesden', 'Kilburn'],
    notes: 'Large, diverse population; borders Ealing, Harrow and Barnet.',
    borderingSlugs: ['ealing', 'harrow', 'barnet'],
    focusKeyword: 'chaperone services Brent',
    metaTitle: 'Chaperone services Brent | Child transport Wembley & Willesden',
    metaDescription:
      'Chaperone services in Brent: Wembley, Willesden, Kingsbury, Harlesden and Kilburn. Child transport and mentoring for schools and local authorities.',
    heroDescription:
      'Chaperone services and child transport across Brent, including Wembley, Willesden, Kingsbury, Harlesden and Kilburn.',
    paragraphs: [
      'Brent’s size and diversity mean transport plans must be precise: authorised recipients, prohibited contact persons and communication needs should be clear before the first journey. CAMS services provides chaperone service cover that local authorities and schools can commission with confidence.',
      'From event-day congestion near Wembley to school runs in Willesden and Kingsbury, we risk-assess routes and match practitioners with the right experience for SEMH, SEND or high-conflict contact.',
      'Brent cases often sit next to Ealing, Harrow or Barnet placements. Tell us if journeys cross borough lines so we can align timing with neighbouring teams.',
    ],
    faq: areaFaq('Brent', 'Wembley'),
    serviceSlugs: CORE_SERVICE_SLUGS,
  },
  {
    slug: 'hillingdon',
    name: 'Hillingdon',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Uxbridge', 'Hayes', 'Ruislip', 'Northwood', 'West Drayton'],
    notes: 'Largest London borough by area; near Heathrow with complex travel patterns.',
    borderingSlugs: ['ealing', 'harrow', 'hounslow'],
    focusKeyword: 'chaperone services Hillingdon',
    metaTitle: 'Chaperone services Hillingdon | Child transport Uxbridge & Hayes',
    metaDescription:
      'Chaperone services in Hillingdon: Uxbridge, Hayes, Ruislip, Northwood and West Drayton. School transport and contact centre cover near Heathrow and West London.',
    heroDescription:
      'Chaperone services across Hillingdon, from Uxbridge and Hayes to Ruislip, Northwood and West Drayton.',
    paragraphs: [
      'Hillingdon is London’s largest borough by area. Long cross-borough journeys and airport-corridor traffic demand realistic scheduling. CAMS services plans chaperone and child transport with buffer time, clear escalation routes and practitioner briefings that match each young person’s plan.',
      'Schools and IFAs in Hayes, West Drayton and Uxbridge commission us for SEMH school transport, placement moves and supervised contact when neutral handovers matter.',
      'Our Greenford HQ sits on the Hillingdon border, so West Drayton and Hayes routes are a natural fit. Include placement addresses and bell times when you refer.',
    ],
    faq: areaFaq('Hillingdon', 'Uxbridge'),
    serviceSlugs: CORE_SERVICE_SLUGS,
  },
  {
    slug: 'barnet',
    name: 'Barnet',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Barnet', 'Finchley', 'Edgware', 'Mill Hill', 'Golders Green'],
    notes: 'Large family population with many schools, with strong demand for school transport and mentoring.',
    borderingSlugs: ['harrow', 'brent'],
    focusKeyword: 'chaperone services Barnet',
    metaTitle: 'Chaperone services Barnet | Child transport Finchley & Edgware',
    metaDescription:
      'Chaperone services in Barnet: Finchley, Edgware, Mill Hill and Golders Green. School transport, mentoring and family support for North London referrers.',
    heroDescription:
      'Chaperone services, school transport support and mentoring across Barnet, Finchley, Edgware, Mill Hill and Golders Green.',
    paragraphs: [
      'Barnet has one of North London’s highest concentrations of schools and family placements. CAMS services supports commissioners who need chaperone service hours for school attendance, contact transport or mentoring when behaviour and engagement need consistent adults.',
      'Finchley, Edgware and Mill Hill present different traffic and safeguarding contexts. We match practitioners to the case and keep referrers updated with factual session or journey notes where commissioned.',
      'Cross-border work with Harrow and Brent is common. Share court orders, PEP priorities and contact schedules at referral so transport and mentoring align with the wider plan.',
    ],
    faq: areaFaq('Barnet', 'Finchley'),
    serviceSlugs: CORE_SERVICE_SLUGS,
  },
  {
    slug: 'hounslow',
    name: 'Hounslow',
    councilType: 'outer-london-borough',
    councilTypeLabel: 'Outer London Borough',
    region: 'Greater London',
    regionSlug: 'greater-london',
    keyAreas: ['Hounslow', 'Brentford', 'Chiswick', 'Feltham', 'Isleworth'],
    notes: 'Near Heathrow; strong transport links and varied referral types.',
    borderingSlugs: ['ealing', 'hillingdon'],
    focusKeyword: 'chaperone services Hounslow',
    metaTitle: 'Chaperone services Hounslow | Child transport Feltham & Brentford',
    metaDescription:
      'Chaperone services in Hounslow: Brentford, Chiswick, Feltham and Isleworth. Child transport and contact centre cover near Heathrow and West London.',
    heroDescription:
      'Chaperone services and child transport across Hounslow, Brentford, Chiswick, Feltham and Isleworth.',
    paragraphs: [
      'Hounslow’s proximity to Heathrow and major roads means chaperone service planning must account for delays, parking restrictions and sudden schedule changes. CAMS services provides dependable cover for contact centres, schools and foster networks across Feltham, Isleworth and Brentford.',
      'Chiswick and Brentford referrals often involve tight handover windows or shared care arrangements. We use neutral, factual documentation and escalate through agreed safeguarding routes when incidents occur.',
      'Hounslow borders Ealing and Hillingdon. Our Greenford team regularly serves West London corridors. Include authorised drop-off recipients and any non-molestation orders affecting travel.',
    ],
    faq: areaFaq('Hounslow', 'Feltham'),
    serviceSlugs: CORE_SERVICE_SLUGS,
  },
  {
    slug: 'watford',
    name: 'Watford',
    councilType: 'unitary-borough',
    councilTypeLabel: 'Hertfordshire (borough)',
    region: 'Hertfordshire',
    regionSlug: 'hertfordshire',
    keyAreas: ['Watford', 'Cassiobury', 'Nascot', 'Garston', 'Oxhey'],
    notes: 'Not a London borough. Hertfordshire town with strong links to West London commissioning routes.',
    borderingSlugs: ['harrow', 'ealing'],
    focusKeyword: 'chaperone services Watford',
    metaTitle: 'Chaperone services Watford | Child transport Hertfordshire',
    metaDescription:
      'Chaperone services in Watford and West Hertfordshire. Child transport, school runs and mentoring for families, schools and agencies linked to West London.',
    heroDescription:
      'Chaperone services and child transport in Watford and surrounding Hertfordshire neighbourhoods, with links into West London placement routes.',
    paragraphs: [
      'Watford sits in Hertfordshire but many placements and schools connect to West London networks. CAMS services covers Watford for chaperone services, school transport support and mentoring when commissioners need Hertfordshire delivery with London-grade safeguarding standards.',
      'Agencies in Garston, Oxhey and central Watford refer us for contact transport, foster moves and SEMH-friendly school runs. Share whether journeys terminate in London boroughs so we can plan cross-border timing.',
      'Our Greenford HQ is a short route from Watford. That helps with practitioner consistency and rapid feasibility checks for new referrals.',
    ],
    faq: areaFaq('Watford', 'central Watford'),
    serviceSlugs: CORE_SERVICE_SLUGS,
  },
];
