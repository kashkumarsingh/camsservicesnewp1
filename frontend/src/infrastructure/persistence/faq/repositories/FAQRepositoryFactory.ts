/**
 * FAQ Repository Factory
 * 
 * Factory for creating FAQ repository instances.
 * Allows switching between Static, LocalStorage, and API implementations.
 */

import { IFAQRepository } from '@/core/application/faq/ports/IFAQRepository';
import { StaticFAQRepository } from './StaticFAQRepository';
import { LocalStorageFAQRepository } from './LocalStorageFAQRepository';
import { ApiFAQRepository } from './ApiFAQRepository';

export type FAQRepositoryType = 'static' | 'localStorage' | 'api';

/**
 * Create FAQ repository based on type
 */
export function createFAQRepository(type?: FAQRepositoryType): IFAQRepository {
  // Check environment variable for repository type
  const repoType = type || (process.env.NEXT_PUBLIC_FAQ_REPOSITORY as FAQRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiFAQRepository();
    case 'localStorage':
      return new LocalStorageFAQRepository();
    case 'static':
    default:
      return new StaticFAQRepository();
  }
}

/**
 * Default FAQ repository instance
 * Uses environment variable or falls back to 'static'
 */
export const faqRepository = createFAQRepository();

