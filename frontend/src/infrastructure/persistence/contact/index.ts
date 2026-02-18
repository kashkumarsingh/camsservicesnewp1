/**
 * Contact Infrastructure - Barrel Exports
 */

export { StaticContactRepository, StaticNewsletterRepository } from './repositories/StaticContactRepository';
export { ApiContactRepository, ApiNewsletterRepository } from './repositories/ApiContactRepository';
export { 
  createContactRepository, 
  createNewsletterRepository,
  contactRepository,
  newsletterRepository
} from './repositories/ContactRepositoryFactory';


