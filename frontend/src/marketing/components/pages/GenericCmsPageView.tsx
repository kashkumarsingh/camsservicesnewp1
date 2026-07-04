import type { ReactElement } from 'react';
import { PolicyDetailPageView } from '@/marketing/components/policies/PolicyDetailPageView';
import type { PageDTO } from '@/core/application/pages/dto/PageDTO';

function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

type GenericCmsPageViewProps = {
  page: PageDTO;
};

export function GenericCmsPageView({ page }: GenericCmsPageViewProps): ReactElement {
  return (
    <PolicyDetailPageView
      page={page}
      isHtmlContent={isHtmlContent}
      labels={{
        lastUpdated: 'Last updated',
        effectiveDate: 'Effective date',
        version: 'Version',
        views: 'views',
      }}
    />
  );
}
