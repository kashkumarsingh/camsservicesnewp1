export type PractitionerProfileSection = {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  readonly subtitle?: string;
};

export type PractitionerProfile = {
  readonly slug: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  readonly avatarKey: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heroEyebrow: string;
  readonly heroSubtitle: string;
  readonly aboutParagraphs: readonly string[];
  readonly experienceIntro: string;
  readonly experienceItems: readonly string[];
  readonly approachIntro: string;
  readonly approachItems: readonly string[];
  readonly qualificationsIntro: string;
  readonly qualifications: readonly string[];
  readonly interestsIntro: string;
  readonly interests: readonly string[];
  readonly interestsFooter?: string;
  readonly familiesExpectParagraphs: readonly string[];
  readonly professionalDocumentsIntro: string;
  readonly professionalDocuments: readonly string[];
  readonly futureFeatures: readonly string[];
  readonly servicesSummary: readonly string[];
};
