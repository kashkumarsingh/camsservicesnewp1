import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import type { PageSeoIntroContent } from '@/marketing/content/page-seo-intros';

type PublicPageSeoSectionProps = PageSeoIntroContent & {
  className?: string;
  headingId?: string;
};

export function PublicPageSeoSection({
  eyebrow,
  title,
  titleAs,
  paragraphs,
  links,
  className,
  headingId,
}: PublicPageSeoSectionProps): ReactElement {
  return (
    <PageSeoProse
      eyebrow={eyebrow}
      title={title}
      titleAs={titleAs}
      paragraphs={paragraphs}
      links={links}
      className={className}
      headingId={headingId}
    />
  );
}
