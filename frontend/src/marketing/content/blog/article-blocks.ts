/**
 * Shared SEO article blocks — CTAs, outbound authority links, table of contents.
 * Pure markdown only (no inline HTML) so ReactMarkdown renders correctly.
 */

export const OUTBOUND = {
  childrensServices:
    'https://www.gov.uk/government/organisations/department-for-education/series/statistics-children-in-need',
  childrenInCare: 'https://www.gov.uk/children-in-care',
  sendCode: 'https://www.gov.uk/government/publications/send-code-of-practice-0-to-25',
  adhdNhs: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/children-and-teenagers/',
  safeguarding: 'https://www.scie.org.uk/children/safeguarding',
  ehcpGuide: 'https://www.ipsea.org.uk/pages/category/ehc-needs-assessments',
  contactOrders: 'https://www.gov.uk/looking-after-children-council/contact-birth-parents',
} as const;

export function articleToc(sections: ReadonlyArray<{ label: string; anchor: string }>): string {
  const items = sections.map((s) => `- [${s.label}](#${s.anchor})`).join('\n');
  return `## In this article\n\n${items}`;
}

export function midArticleCta(heading: string, body: string): string {
  return `
---

> ### ${heading}
>
> ${body}
>
> **[Make a referral →](/referral)** · **[Contact our team →](/contact)** · **[Compare packages →](/packages)**

---
`.trim();
}

export function endArticleCta(heading: string, body: string): string {
  return `
## ${heading}

${body}

**[Make a referral →](/referral)** · **[Speak to CAMS →](/contact)** · **[View all services →](/services)**
`.trim();
}

export function faqSection(items: ReadonlyArray<{ q: string; a: string }>): string {
  return items
    .map((item) => `### ${item.q}\n\n${item.a}`)
    .join('\n\n');
}
