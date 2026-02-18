import { IPageRepository } from '@/core/application/pages/ports/IPageRepository';
import { ApiPageRepository } from './ApiPageRepository';
import { StaticPageRepository } from './StaticPageRepository';

export type PageRepositoryType = 'static' | 'api';

export function createPageRepository(type?: PageRepositoryType): IPageRepository {
  const repoType =
    type || (process.env.NEXT_PUBLIC_PAGE_REPOSITORY as PageRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiPageRepository();
    case 'static':
    default:
      return new StaticPageRepository();
  }
}

export const pageRepository = createPageRepository();


