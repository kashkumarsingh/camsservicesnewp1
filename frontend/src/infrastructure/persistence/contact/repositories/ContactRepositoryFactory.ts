/**
 * Contact Repository Factory
 * 
 * Factory for creating contact repository instances.
 */

import { IContactRepository, INewsletterRepository } from '@/core/application/contact/ports/IContactRepository';
import { StaticContactRepository, StaticNewsletterRepository } from './StaticContactRepository';
import { ApiContactRepository, ApiNewsletterRepository } from './ApiContactRepository';

export type ContactRepositoryType = 'static' | 'api';

/**
 * Create contact repository based on type
 */
export function createContactRepository(type?: ContactRepositoryType): IContactRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_CONTACT_REPOSITORY as ContactRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiContactRepository();
    case 'static':
    default:
      return new StaticContactRepository();
  }
}

/**
 * Create newsletter repository based on type
 */
export function createNewsletterRepository(type?: ContactRepositoryType): INewsletterRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_CONTACT_REPOSITORY as ContactRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiNewsletterRepository();
    case 'static':
    default:
      return new StaticNewsletterRepository();
  }
}

/**
 * Default repository instances
 */
export const contactRepository = createContactRepository();
export const newsletterRepository = createNewsletterRepository();


