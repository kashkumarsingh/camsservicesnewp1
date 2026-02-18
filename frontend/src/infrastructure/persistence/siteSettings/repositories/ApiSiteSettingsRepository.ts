import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';
import { SiteSettingsDTO } from '@/core/application/siteSettings/dto/SiteSettingsDTO';
import { SiteSettingsMapper } from '@/core/application/siteSettings/mappers/SiteSettingsMapper';
import { ISiteSettingsRepository } from './ISiteSettingsRepository';

/**
 * Remote Site Settings Response
 * Matches the Laravel API response structure
 */
interface RemoteSiteSettingsResponse {
  success: boolean;
  data: SiteSettingsDTO;
}

/**
 * API Site Settings Repository
 * 
 * Clean Architecture Layer: Infrastructure (Persistence)
 * 
 * Fetches site settings from the Laravel backend API.
 * This is the production implementation that talks to the real API.
 * 
 * Plain English: This class is responsible for fetching site settings
 * from the backend API. It:
 * 1. Makes an HTTP request to /api/v1/site-settings
 * 2. Receives the raw API response
 * 3. Converts it to a domain entity using the mapper
 * 4. Returns the domain entity to the use case
 * 
 * Docker Command: No specific command needed - this runs in the frontend container
 */
export class ApiSiteSettingsRepository implements ISiteSettingsRepository {
  /**
   * Get site settings from the API
   * 
   * Plain English: Fetches site settings from the backend API endpoint
   * and converts it to a domain entity.
   * 
   * @returns Promise that resolves to SiteSetting domain entity
   */
  async get(): Promise<SiteSetting> {
    try {
      console.log('[ApiSiteSettingsRepository] Fetching site settings from:', API_ENDPOINTS.SITE_SETTINGS);
      
      // Fetch from API
      // The ApiClient automatically unwraps Laravel's { success: true, data: ... } response
      const response = await apiClient.get<SiteSettingsDTO>(API_ENDPOINTS.SITE_SETTINGS);
      
      console.log('[ApiSiteSettingsRepository] Received response:', response);
      console.log('[ApiSiteSettingsRepository] Response data:', response.data);
      
      // Convert DTO to Domain Entity
      const domainEntity = SiteSettingsMapper.toDomain(response.data);
      console.log('[ApiSiteSettingsRepository] Mapped to domain entity:', domainEntity);
      
      return domainEntity;
    } catch (error) {
      // Log error for debugging
      console.error('[ApiSiteSettingsRepository] Failed to fetch site settings:', error);
      console.error('[ApiSiteSettingsRepository] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      });
      
      // Re-throw with more context
      throw new Error(
        `Failed to fetch site settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

