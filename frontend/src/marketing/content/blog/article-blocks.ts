/**
 * Shared SEO article blocks — CTAs, outbound authority links, table of contents.
 * Pure markdown only (no inline HTML) so ReactMarkdown renders correctly.
 *
 * CTA blocks use [[CTA]] markers parsed by BlogArticleBody into proper buttons.
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

export const CTA_BLOCK_START = '[[CTA]]';
export const CTA_BLOCK_END = '[[/CTA]]';

export type CtaActionDef = {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
};

const DEFAULT_MID_CTA_ACTIONS: readonly CtaActionDef[] = [
  { label: 'Make a referral', href: '/referral', variant: 'primary' },
  { label: 'Contact our team', href: '/contact', variant: 'secondary' },
  { label: 'Compare packages', href: '/packages', variant: 'secondary' },
];

const DEFAULT_END_CTA_ACTIONS: readonly CtaActionDef[] = [
  { label: 'Make a referral', href: '/referral', variant: 'primary' },
  { label: 'Speak to CAMS', href: '/contact', variant: 'secondary' },
  { label: 'View all services', href: '/services', variant: 'secondary' },
];

export function articleToc(sections: ReadonlyArray<{ label: string; anchor: string }>): string {
  const items = sections.map((s) => `- [${s.label}](#${s.anchor})`).join('\n');
  return `## In this article\n\n${items}`;
}

function ctaBlock(
  heading: string,
  body: string,
  actions: readonly CtaActionDef[] = DEFAULT_MID_CTA_ACTIONS
): string {
  const actionLines = actions.map((a) => `${a.label}|${a.href}|${a.variant}`).join('\n');
  return `${CTA_BLOCK_START}\n${heading}\n${body}\n${actionLines}\n${CTA_BLOCK_END}`;
}

export function midArticleCta(heading: string, body: string): string {
  return `\n---\n\n${ctaBlock(heading, body, DEFAULT_MID_CTA_ACTIONS)}\n\n---`;
}

export function endArticleCta(heading: string, body: string): string {
  return ctaBlock(heading, body, DEFAULT_END_CTA_ACTIONS);
}

export function faqSection(items: ReadonlyArray<{ q: string; a: string }>): string {
  return items.map((item) => `### ${item.q}\n\n${item.a}`).join('\n\n');
}

/** Parse a [[CTA]] block body into props for BlogInlineCta. */
export function parseCtaBlock(raw: string): {
  heading: string;
  body: string;
  actions: CtaActionDef[];
} {
  const lines = raw.trim().split('\n').filter(Boolean);
  const heading = lines[0] ?? '';
  const actionStart = lines.findIndex((line) => line.includes('|'));
  const bodyLines = actionStart > 1 ? lines.slice(1, actionStart) : lines[1] ? [lines[1]] : [];
  const body = bodyLines.join(' ');
  const actions: CtaActionDef[] = lines
    .slice(actionStart >= 0 ? actionStart : lines.length)
    .filter((line) => line.includes('|'))
    .map((line) => {
      const [label, href, variant] = line.split('|');
      return {
        label: label?.trim() ?? '',
        href: href?.trim() ?? '/',
        variant: variant?.trim() === 'primary' ? 'primary' : 'secondary',
      };
    });

  return { heading, body, actions };
}
