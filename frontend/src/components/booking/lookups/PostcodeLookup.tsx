'use client';

import React, { useState, useMemo } from 'react';
import { Search, Loader2, MapPin, X, AlertCircle, Edit3 } from 'lucide-react';
import { validateUKPostcode, getRegionFromPostcode } from '@/utils/locationUtils';
import Button from '@/components/ui/Button/Button';
import { Address } from '@/core/domain/location';
import { LookupAddressesByPostcodeUseCase } from '@/core/application/address/useCases/LookupAddressesByPostcodeUseCase';
import { AddressLookupService } from '@/infrastructure/services/address/AddressLookupService';

// Address interface for component props (backward compatibility)
export interface AddressProps {
  fullAddress: string;
  line1: string;
  line2?: string;
  town?: string;
  city?: string;
  county?: string;
  region?: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
}

interface PostcodeLookupProps {
  onAddressSelect: (address: AddressProps) => void;
  label?: string;
  required?: boolean;
  className?: string;
  initialAddress?: AddressProps; // Preselected address to persist across steps
}

/**
 * PostcodeLookup Component
 * 
 * Allows users to enter a UK postcode and select their address from a list.
 * Uses Ideal Postcodes API for real UK address lookup.
 */
const PostcodeLookup: React.FC<PostcodeLookupProps> = ({
  onAddressSelect,
  label = 'Address',
  required = false,
  className = '',
  initialAddress,
}) => {
  // Initialize use case (Infrastructure dependency injection)
  const lookupUseCase = useMemo(
    () => new LookupAddressesByPostcodeUseCase(new AddressLookupService()),
    []
  );

  const [postcode, setPostcode] = useState('');
  const [postcodeError, setPostcodeError] = useState('');
  const [postcodeValid, setPostcodeValid] = useState<boolean | null>(null); // null = not validated yet, true = valid, false = invalid
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [apiLimitExceeded, setApiLimitExceeded] = useState(false);

  // Persist selected address across unmount/mount cycles (e.g., navigating steps)
  React.useEffect(() => {
    if (initialAddress && !selectedAddress) {
      // Convert initialAddress (plain object) to Address domain entity
      try {
        const address = Address.create(
          initialAddress.fullAddress,
          initialAddress.line1,
          initialAddress.postcode,
          initialAddress.region || 'Unknown',
          initialAddress.line2,
          initialAddress.town,
          initialAddress.city,
          initialAddress.county,
          initialAddress.latitude,
          initialAddress.longitude
        );
        setSelectedAddress(address);
        setPostcode(initialAddress.postcode || '');
      } catch (error) {
        console.error('Error creating Address from initialAddress:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAddress]);

  const handlePostcodeChange = (value: string) => {
    setPostcode(value);
    setPostcodeError('');
    setAddresses([]);
    setShowAddressList(false);
    setSelectedAddress(null);
    
    // Real-time validation as user types
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setPostcodeValid(null); // Reset validation state when empty
    } else {
      // Validate postcode format in real-time
      const isValid = validateUKPostcode(trimmed);
      setPostcodeValid(isValid);
      if (!isValid && trimmed.length > 2) {
        // Only show error if user has typed enough characters
        setPostcodeError('Invalid UK postcode format');
      } else if (isValid) {
        setPostcodeError(''); // Clear error if valid
      }
    }
  };

  const fetchAddresses = async () => {
    if (!postcode.trim()) {
      setPostcodeError('Please enter a postcode');
      return;
    }

    setLoading(true);
    setPostcodeError('');

    try {
      // Use Application layer use case
      const result = await lookupUseCase.execute(postcode);

      if (result.error) {
        // Handle different error types
        switch (result.error) {
          case 'INVALID_POSTCODE':
            setPostcodeError('Invalid UK postcode format');
            setAddresses([]);
            setShowAddressList(false);
            break;
          case 'POSTCODE_NOT_FOUND':
            setPostcodeError('Postcode not found. Please check and try again, or enter manually.');
            setAddresses([]);
            setShowAddressList(false);
            break;
          case 'API_LIMIT_EXCEEDED':
            // API limit exceeded - smoothly transition to manual entry
            setApiLimitExceeded(true);
            setPostcodeError('');
            setAddresses([]);
            setShowAddressList(false);
            setManualMode(true); // Automatically switch to manual mode
            // Don't block user - allow them to proceed with manual entry
            break;
          case 'NO_ADDRESSES_FOUND':
            setPostcodeError('No addresses found for this postcode. Please enter manually.');
            setAddresses([]);
            setShowAddressList(false);
            break;
          case 'SERVICE_NOT_CONFIGURED':
            // Service not configured - automatically enable manual entry
            setApiLimitExceeded(true);
            setPostcodeError('');
            setAddresses([]);
            setShowAddressList(false);
            setManualMode(true); // Automatically switch to manual mode
            break;
          case 'NETWORK_ERROR':
          default:
            setPostcodeError('Unable to reach address service. Please try again or enter your address manually.');
            setAddresses([]);
            setShowAddressList(false);
            break;
        }
        return;
      }

      // Success - addresses found
      setAddresses(result.addresses);
      setShowAddressList(true);
    } catch (error) {
      console.error('Postcode lookup error:', error);
      setPostcodeError('Unable to reach address service. Please try again or enter your address manually.');
      setAddresses([]);
      setShowAddressList(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (index: number) => {
    const address = addresses[index];
    setSelectedAddress(address);
    setShowAddressList(false);
    onAddressSelect(address.toJSON()); // Convert domain entity to plain object for callback
  };

  const handleManualSubmit = () => {
    if (!manualAddress.trim()) {
      return;
    }

    try {
      // Use Application layer use case to create manual address
      const manualAddressObj = lookupUseCase.createManualAddress(manualAddress, postcode.trim());

      setSelectedAddress(manualAddressObj);
      onAddressSelect(manualAddressObj.toJSON()); // Convert to plain object for callback
      setManualMode(false);
      setApiLimitExceeded(false); // Reset flag after successful submission
    } catch (error) {
      console.error('Error creating manual address:', error);
      setPostcodeError('Invalid address data. Please check your input.');
    }
  };

  const reset = () => {
    setPostcode('');
    setPostcodeError('');
    setAddresses([]);
    setShowAddressList(false);
    setSelectedAddress(null);
    setManualMode(false);
    setManualAddress('');
    setApiLimitExceeded(false);
  };

  // If address already selected, show it
  if (selectedAddress && !manualMode) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <MapPin className="text-green-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">{selectedAddress.fullAddress}</p>
                {(selectedAddress.county || selectedAddress.region || selectedAddress.postcode) && (
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedAddress.county || selectedAddress.region}
                    {selectedAddress.postcode ? ` • ${selectedAddress.postcode}` : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Change address"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Postcode Input */}
      <div className="mb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={postcode}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              placeholder="Enter postcode (e.g., AL10 9DA)"
              className={`w-full pl-9 pr-3 py-2.5 border-2 rounded-lg focus:outline-none text-sm text-gray-900 ${
                postcodeError || postcodeValid === false
                  ? 'border-red-500 bg-red-50'
                  : postcodeValid === true
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 focus:border-[#0080FF] bg-white'
              }`}
              disabled={loading}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchAddresses(); } }}
            />
            {/* Real-time validation indicator */}
            {postcode.trim().length > 0 && postcodeValid !== null && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {postcodeValid ? (
                  <span className="text-green-600 text-xs font-semibold" title="Valid postcode">✓</span>
                ) : (
                  <span className="text-red-600 text-xs font-semibold" title="Invalid postcode">✗</span>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={fetchAddresses}
            disabled={loading || !postcode.trim()}
            className="px-6"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Finding...
              </>
            ) : (
              <>
                <Search size={16} className="mr-2" />
                Find Address
              </>
            )}
          </Button>
        </div>
        {postcodeError && <p className="mt-1 text-xs text-red-600 font-medium">{postcodeError}</p>}
        {postcode && !postcodeError && !loading && postcodeValid === true && (
          <div className="mt-1 text-xs text-green-700 flex items-center justify-between">
            <span className="font-medium">✓ Valid postcode • Region: {getRegionFromPostcode(postcode)}</span>
            <span className="text-gray-500">Press Enter or click "Find Address"</span>
          </div>
        )}
        {postcode && !postcodeError && !loading && postcodeValid === null && (
          <div className="mt-1 text-xs text-gray-500">
            Press Enter or click "Find Address" to search
          </div>
        )}
      </div>

      {/* Address List */}
      {showAddressList && addresses.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select your address:
          </label>
          <select
            onChange={(e) => handleAddressSelect(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0080FF] focus:outline-none text-sm"
          >
            <option value="">-- Select your address --</option>
            {addresses.map((addr, index) => (
              <option key={index} value={index}>
                {addr.fullAddress}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Manual Entry Fallback - Always show if API limit exceeded or if addresses found */}
      {(showAddressList || apiLimitExceeded) && !manualMode && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="text-sm text-[#0080FF] hover:underline font-medium"
          >
            {apiLimitExceeded ? 'Enter address manually' : "Can't find your address? Enter manually"}
          </button>
        </div>
      )}

      {/* Manual Entry Mode - Always accessible when API limit exceeded */}
      {(manualMode || apiLimitExceeded) && (
        <div className={`mb-3 p-4 rounded-lg border-2 transition-all ${
          apiLimitExceeded 
            ? 'bg-amber-50 border-amber-200 shadow-md' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          {apiLimitExceeded && (
            <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Address Lookup Temporarily Unavailable
                </p>
                <p className="text-xs text-amber-800">
                  Our address lookup service has reached its limit. No worries! You can enter your address manually below.
                </p>
              </div>
            </div>
          </div>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <Edit3 className={`${apiLimitExceeded ? 'text-amber-600' : 'text-gray-600'}`} size={18} />
            <label className="block text-sm font-semibold text-gray-700">
              {apiLimitExceeded ? 'Enter your address manually:' : 'Enter address manually:'}
            </label>
          </div>
          
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="e.g., 123 High Street, Town, County"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-sm mb-3 transition-colors text-gray-900 ${
              apiLimitExceeded
                ? 'border-amber-300 focus:border-amber-400 bg-white'
                : 'border-gray-200 focus:border-[#0080FF] bg-white'
            }`}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualSubmit} 
              disabled={!manualAddress.trim()}
              className={apiLimitExceeded ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' : ''}
            >
              {apiLimitExceeded ? '✓ Confirm Address' : 'Use This Address'}
            </Button>
            {!apiLimitExceeded && (
              <Button 
                onClick={() => {
                  setManualMode(false);
                  setManualAddress('');
                }} 
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
          
          {apiLimitExceeded && (
            <p className="mt-2 text-xs text-amber-700">
              Your postcode ({postcode}) will be automatically added to your address.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostcodeLookup;
