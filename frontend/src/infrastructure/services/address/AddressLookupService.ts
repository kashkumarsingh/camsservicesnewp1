/**
 * Address Lookup Service
 * 
 * Clean Architecture Layer: Infrastructure (External Service)
 * Purpose: Handles communication with Ideal Postcodes API
 */

import { Address } from '@/core/domain/location';
import { getRegionFromPostcode } from '@/utils/locationUtils';

export interface IdealPostcodesResponse {
  result: Array<{
    line_1: string;
    line_2?: string;
    line_3?: string;
    post_town: string;
    county?: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
  }>;
  code?: number;
}

export interface AddressLookupError {
  code: number;
  message: string;
}

export class AddressLookupService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.ideal-postcodes.co.uk/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Ideal Postcodes API key not configured');
    }
  }

  /**
   * Lookup addresses by postcode
   */
  async lookupByPostcode(postcode: string): Promise<Address[]> {
    if (!this.apiKey) {
      throw new Error('Address lookup service not configured');
    }

    const formattedPostcode = postcode.trim().toUpperCase().replace(/\s+/g, '');
    const postcodeWithSpace = formattedPostcode.replace(/(.{3})(.*)/, '$1 $2');

    try {
      const response = await fetch(
        `${this.baseUrl}/postcodes/${encodeURIComponent(postcodeWithSpace)}?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404 || errorData.code === 4040) {
          throw new Error('POSTCODE_NOT_FOUND');
        }
        
        if (response.status === 402 || errorData.code === 4020) {
          throw new Error('API_LIMIT_EXCEEDED');
        }
        
        throw new Error('ADDRESS_LOOKUP_FAILED');
      }

      const data: IdealPostcodesResponse = await response.json();

      if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
        throw new Error('NO_ADDRESSES_FOUND');
      }

      // Map API response to Domain entities
      const region = getRegionFromPostcode(formattedPostcode);
      
      return data.result.map((addr) => {
        const addressParts = [
          addr.line_1,
          addr.line_2,
          addr.line_3,
          addr.post_town,
          addr.postcode
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        return Address.create(
          fullAddress,
          addr.line_1 || '',
          addr.postcode || formattedPostcode,
          region,
          addr.line_2,
          addr.post_town,
          addr.post_town || addr.county || '',
          addr.county,
          addr.latitude,
          addr.longitude
        );
      });
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw domain-specific errors
        if (['POSTCODE_NOT_FOUND', 'API_LIMIT_EXCEEDED', 'NO_ADDRESSES_FOUND', 'ADDRESS_LOOKUP_FAILED'].includes(error.message)) {
          throw error;
        }
      }
      
      // Network or other errors
      throw new Error('NETWORK_ERROR');
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

