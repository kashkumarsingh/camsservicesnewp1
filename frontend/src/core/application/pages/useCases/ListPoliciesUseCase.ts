import { IPageRepository } from '@/core/application/pages/ports/IPageRepository';
import { Page } from '@/core/domain/pages/entities/Page';

/** Page type slugs that are shown under /policies (public). */
const POLICY_PAGE_TYPES = [
  'privacy-policy',
  'terms-of-service',
  'cancellation-policy',
  'cookie-policy',
  'payment-refund-policy',
  'safeguarding-policy',
] as const;

export class ListPoliciesUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(): Promise<Page[]> {
    const pages = await this.pageRepository.findAll();
    return pages.filter(
      (page) => POLICY_PAGE_TYPES.includes(page.type as (typeof POLICY_PAGE_TYPES)[number]) && page.published
    );
  }
}


