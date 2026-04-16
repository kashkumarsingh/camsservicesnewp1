import type { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import Section from '@/components/layout/Section';
import { renderHtml } from '@/shared/utils/htmlRenderer';
import { formatDate } from '@/shared/utils/formatDate';
import { DATE_FORMAT_LONG } from '@/shared/utils/appConstants';
import type { PageDTO } from '@/core/application/pages/dto/PageDTO';

type PolicyDetailPageViewProps = {
  page: PageDTO;
  isHtmlContent: (content: string) => boolean;
  labels: {
    lastUpdated: string;
    effectiveDate: string;
    version: string;
    views: string;
  };
};

export function PolicyDetailPageView({ page, isHtmlContent, labels }: PolicyDetailPageViewProps): ReactElement {
  const lastUpdated = page.lastUpdated ? new Date(page.lastUpdated) : undefined;
  const effectiveDate = page.effectiveDate ? new Date(page.effectiveDate) : undefined;

  return (
    <div>
      <Section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-primary-blue to-navy-blue">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/svgs/geometric-pattern.svg')", backgroundRepeat: 'repeat' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight tracking-tight">{page.title}</h1>
          {page.summary && <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-sans font-light">{page.summary}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/80">
            {lastUpdated && <span>{labels.lastUpdated}: {formatDate(lastUpdated, DATE_FORMAT_LONG)}</span>}
            {effectiveDate && <span>{labels.effectiveDate}: {formatDate(effectiveDate, DATE_FORMAT_LONG)}</span>}
            <span>{labels.version}: {page.version ?? '1.0'}</span>
            <span>{page.views ?? 0} {labels.views}</span>
          </div>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <article className="prose prose-lg md:prose-xl max-w-4xl mx-auto text-navy-blue">
            {isHtmlContent(page.content ?? '')
              ? renderHtml(page.content ?? '', 'prose prose-lg md:prose-xl max-w-none')
              : <ReactMarkdown>{page.content ?? ''}</ReactMarkdown>}
          </article>
        </Section>
      </div>
    </div>
  );
}
