/**
 * FAQ Infrastructure - Barrel Exports
 */

export { StaticFAQRepository } from './repositories/StaticFAQRepository';
export { LocalStorageFAQRepository } from './repositories/LocalStorageFAQRepository';
export { ApiFAQRepository } from './repositories/ApiFAQRepository';
export { createFAQRepository, faqRepository } from './repositories/FAQRepositoryFactory';

