/**
 * Lookup Addresses By Postcode Use Case
 * 
 * Clean Architecture Layer: Application (Use Case)
 * Purpose: Orchestrates address lookup business logic
 */

import { Address } from '@/core/domain/location';
import { AddressLookupService } from '@/infrastructure/services/address/AddressLookupService';
import { validateUKPostcode } from '@/utils/locationUtils';
import { getRegionFromPostcode } from '@/utils/locationUtils';

export interface LookupAddressesResult {
  addresses: Address[];
  error?: 'INVALID_POSTCODE' | 'POSTCODE_NOT_FOUND' | 'API_LIMIT_EXCEEDED' | 'NO_ADDRESSES_FOUND' | 'NETWORK_ERROR' | 'SERVICE_NOT_CONFIGURED';
}

export class LookupAddressesByPostcodeUseCase {
  constructor(
    private readonly addressLookupService: AddressLookupService
  ) {}

  async execute(postcode: string): Promise<LookupAddressesResult> {
    // Validate postcode format
    const formattedPostcode = postcode.trim().toUpperCase().replace(/\s+/g, '');
    
    if (!validateUKPostcode(formattedPostcode)) {
      return {
        addresses: [],
        error: 'INVALID_POSTCODE'
      };
    }

    // Check if service is configured
    if (!this.addressLookupService.isConfigured()) {
      return {
        addresses: [],
        error: 'SERVICE_NOT_CONFIGURED'
      };
    }

    try {
      const addresses = await this.addressLookupService.lookupByPostcode(formattedPostcode);
      
      return {
        addresses
      };
    } catch (error) {
      if (error instanceof Error) {
        const errorMap: Record<string, LookupAddressesResult['error']> = {
          'POSTCODE_NOT_FOUND': 'POSTCODE_NOT_FOUND',
          'API_LIMIT_EXCEEDED': 'API_LIMIT_EXCEEDED',
          'NO_ADDRESSES_FOUND': 'NO_ADDRESSES_FOUND',
          'ADDRESS_LOOKUP_FAILED': 'NETWORK_ERROR',
          'NETWORK_ERROR': 'NETWORK_ERROR'
        };

        return {
          addresses: [],
          error: errorMap[error.message] || 'NETWORK_ERROR'
        };
      }

      return {
        addresses: [],
        error: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Create manual address entry
   */
  createManualAddress(fullAddress: string, postcode: string): Address {
    const formattedPostcode = postcode.trim().toUpperCase().replace(/\s+/g, '');
    const region = getRegionFromPostcode(formattedPostcode);
    
    // Include postcode in full address if not already present
    const fullAddressText = fullAddress.includes(formattedPostcode) 
      ? fullAddress 
      : `${fullAddress}, ${formattedPostcode}`;
    
    return Address.createManual(fullAddressText, formattedPostcode, region);
  }
}

