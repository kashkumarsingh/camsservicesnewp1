import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { ListPoliciesUseCase } from '@/core/application/pages/useCases/ListPoliciesUseCase';
import { PageMapper } from '@/core/application/pages/mappers/PageMapper';
import type { PageDTO } from '@/core/application/pages/dto/PageDTO';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { StaticPageRepository } from '@/infrastructure/persistence/pages/repositories/StaticPageRepository';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';
import { POLICY_DOCUMENT_SLUGS } from '@/dashboard/utils/publicPageConstants';

function isPolicySlug(slug: string): boolean {
  return (POLICY_DOCUMENT_SLUGS as readonly string[]).includes(slug);
}

export async function getPolicyPageWithFallback(slug: string): Promise<PageDTO | null> {
  const useCase = new GetPageUseCase(pageRepository);
  const page = await withTimeoutFallback(useCase.execute(slug), 5000, null);
  if (page) return page;

  if (!isPolicySlug(slug)) return null;

  const staticPage = await new StaticPageRepository().findBySlug(slug);
  return staticPage?.published ? PageMapper.toDTO(staticPage) : null;
}

export async function listPolicyPagesWithFallback(): Promise<PageDTO[]> {
  const useCase = new ListPoliciesUseCase(pageRepository);
  const policies = await withTimeoutFallback(useCase.execute(), 5000, []);
  if (policies.length > 0) {
    return policies.map((page) => PageMapper.toDTO(page));
  }

  const staticRepo = new StaticPageRepository();
  const staticPages = await Promise.all(
    POLICY_DOCUMENT_SLUGS.map((slug) => staticRepo.findBySlug(slug)),
  );

  return staticPages
    .filter((page) => page?.published)
    .map((page) => PageMapper.toDTO(page!));
}

export function getStaticPolicySlugs(): string[] {
  return [...POLICY_DOCUMENT_SLUGS];
}
