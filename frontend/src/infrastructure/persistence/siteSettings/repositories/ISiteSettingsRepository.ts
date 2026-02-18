import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';

/**
 * Site Settings Repository Interface
 * 
 * Clean Architecture Layer: Infrastructure (Interface)
 * 
 * Defines the contract for fetching site settings.
 * This allows us to swap implementations (API, static, mock) without
 * changing the rest of the application.
 * 
 * Plain English: This is a promise/contract that says "any class that
 * implements this interface must be able to fetch site settings".
 * It doesn't care HOW it fetches them - just that it CAN.
 * 
 * This abstraction allows us to:
 * - Use API in production
 * - Use static data in development
 * - Use mock data in tests
 * All without changing the code that uses it.
 */
export interface ISiteSettingsRepository {
  /**
   * Get site settings
   * 
   * Plain English: Fetches the site settings from wherever they're stored
   * (API, static file, etc.) and returns them as a domain entity.
   * 
   * @returns Promise that resolves to SiteSetting domain entity
   */
  get(): Promise<SiteSetting>;
}

