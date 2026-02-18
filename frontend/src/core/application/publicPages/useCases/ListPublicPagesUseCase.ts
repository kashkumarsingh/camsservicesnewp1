/**
 * List Public Pages Use Case
 *
 * Orchestrates listing public pages for the admin dashboard.
 */

import type { PublicPageDTO } from "../dto/PublicPageDTO";
import type {
  IPublicPagesRepository,
  PublicPageFilterOptions,
} from "../ports/IPublicPagesRepository";

export class ListPublicPagesUseCase {
  constructor(private readonly repository: IPublicPagesRepository) {}

  async execute(options?: PublicPageFilterOptions): Promise<PublicPageDTO[]> {
    return this.repository.list(options);
  }
}

