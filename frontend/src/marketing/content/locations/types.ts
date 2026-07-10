export type LocationCouncilType = 'outer-london-borough' | 'unitary-borough' | 'county-town';

export type LocationAreaFaq = {
  readonly q: string;
  readonly a: string;
};

export type LocationArea = {
  readonly slug: string;
  readonly name: string;
  readonly councilType: LocationCouncilType;
  readonly councilTypeLabel: string;
  readonly region: string;
  readonly regionSlug: string;
  readonly keyAreas: readonly string[];
  readonly notes: string;
  readonly borderingSlugs: readonly string[];
  readonly isHeadquarters?: boolean;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly focusKeyword: string;
  readonly heroDescription: string;
  readonly paragraphs: readonly string[];
  readonly faq: readonly LocationAreaFaq[];
  /** Service programme slugs from SERVICE_PROGRAMME_LIST, linked on the area page. */
  readonly serviceSlugs: readonly string[];
};
