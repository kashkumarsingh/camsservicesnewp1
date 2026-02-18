import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';
import { ISiteSettingsRepository } from '@/infrastructure/persistence/siteSettings/repositories/ISiteSettingsRepository';

/**
 * Get Site Settings Use Case
 * 
 * Clean Architecture Layer: Application
 * 
 * Orchestrates fetching site settings from the repository.
 * This is the business logic layer that coordinates between
 * the domain and infrastructure layers.
 * 
 * Plain English: This is the "brain" that knows HOW to get site settings.
 * It doesn't care WHERE they come from (API, static file, etc.) - that's
 * the repository's job. This use case just says "go get the settings"
 * and handles any business logic around that.
 * 
 * Docker Command: No specific command needed - this runs in the frontend container
 */
export class GetSiteSettingsUseCase {
  constructor(
    private readonly siteSettingsRepository: ISiteSettingsRepository
  ) {}

  /**
   * Execute the use case: Get site settings
   * 
   * Plain English: Fetches site settings from the repository and returns them.
   * This is a singleton pattern - there's only ever one site settings record.
   * 
   * @returns Promise that resolves to SiteSetting domain entity
   */
  async execute(): Promise<SiteSetting> {
    return this.siteSettingsRepository.get();
  }
}

