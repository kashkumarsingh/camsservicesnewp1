'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import BaseModal from '@/components/ui/Modal/BaseModal';
import Button from '@/components/ui/Button';
import PostcodeLookup from '@/components/booking/lookups/PostcodeLookup';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import { validateFullName, validateAge } from '@/utils/validation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AddChildFormData {
  name: string;
  age: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  address: string;
  postcode: string;
  city: string;
  region: string;
}

/**
 * Add Child Modal Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Modal for adding a new child without leaving the dashboard
 * Location: frontend/src/components/dashboard/modals/AddChildModal.tsx
 */
export default function AddChildModal({
  isOpen,
  onClose,
  onSuccess,
}: AddChildModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AddChildFormData>({
    name: '',
    age: '',
    date_of_birth: '',
    gender: '',
    address: '',
    postcode: '',
    city: '',
    region: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressSameAsParent, setAddressSameAsParent] = useState(false);

  const parentAddress = user?.address || user?.postcode
    ? { address: user?.address ?? '', postcode: user?.postcode ?? '', region: user?.county ?? '' }
    : null;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        age: '',
        date_of_birth: '',
        gender: '',
        address: '',
        postcode: '',
        city: '',
        region: '',
      });
      setErrors({});
      setTouched({});
      setIsValid({});
      setIsSubmitting(false);
      setAddressSameAsParent(false);
    }
  }, [isOpen]);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    if (touched.name || formData.name) {
      const nameValidation = validateFullName(formData.name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error || 'Please enter both first and last name';
        newIsValid.name = false;
      } else {
        newIsValid.name = true;
      }
    }

    // Validate DOB (required)
    if (touched.date_of_birth || formData.date_of_birth) {
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required';
        newIsValid.date_of_birth = false;
      } else {
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        if (dob > today) {
          newErrors.date_of_birth = 'Date of birth cannot be in the future';
          newIsValid.date_of_birth = false;
        } else {
          newIsValid.date_of_birth = true;
        }
      }
    }

    // Validate age (auto-calculated, but check if valid)
    if (formData.age) {
      const ageValidation = validateAge(formData.age);
      if (!ageValidation.valid) {
        newErrors.age = ageValidation.error || 'Age must be between 0 and 25';
        newIsValid.age = false;
      } else {
        newIsValid.age = true;
      }
    }

    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData, touched]);

  // Calculate age from date of birth
  const calculateAgeFromDOB = useCallback((dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 && age <= 25 ? age : null;
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-calculate age when DOB changes
    if (name === 'date_of_birth' && value) {
      const calculatedAge = calculateAgeFromDOB(value);
      if (calculatedAge !== null) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          age: calculatedAge.toString()
        }));
        setTouched(prev => ({ ...prev, age: true, [name]: true }));
        return;
      }
    }
    
    // Age is read-only
    if (name === 'age') {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  }, [calculateAgeFromDOB, touched]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleAddressSelect = useCallback((data: {
    fullAddress?: string;
    line1?: string;
    postcode?: string;
    city?: string;
    town?: string;
    region?: string;
    county?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      postcode: data.postcode || prev.postcode,
      address: data.fullAddress || data.line1 || prev.address,
      city: data.city || data.town || prev.city,
      region: data.region || data.county || prev.region,
    }));
  }, []);

  const handleAddressSameAsParentChange = useCallback(() => {
    const next = !addressSameAsParent;
    setAddressSameAsParent(next);
    if (next && parentAddress) {
      setFormData(prev => ({
        ...prev,
        address: parentAddress.address,
        postcode: parentAddress.postcode,
        region: parentAddress.region,
        city: prev.city,
      }));
    } else if (!next) {
      setFormData(prev => ({
        ...prev,
        address: '',
        postcode: '',
        city: '',
        region: '',
      }));
    }
  }, [addressSameAsParent, parentAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      name: true,
      age: true,
      date_of_birth: true,
    });

    const nameValidation = validateFullName(formData.name);
    
    // Validate DOB is required
    if (!formData.date_of_birth) {
      setErrors(prev => ({
        ...prev,
        name: nameValidation.error || '',
        date_of_birth: 'Date of birth is required',
      }));
      setIsValid({
        name: nameValidation.valid,
        date_of_birth: false,
      });
      return;
    }

    // Ensure age is calculated from DOB
    let finalAge = formData.age;
    if (!finalAge) {
      const calculatedAge = calculateAgeFromDOB(formData.date_of_birth);
      if (calculatedAge !== null) {
        finalAge = calculatedAge.toString();
        setFormData(prev => ({ ...prev, age: finalAge }));
      } else {
        setErrors(prev => ({
          ...prev,
          name: nameValidation.error || '',
          age: 'Unable to calculate age from date of birth',
        }));
        setIsValid({
          name: nameValidation.valid,
          age: false,
        });
        return;
      }
    }

    const ageValidation = validateAge(finalAge);
    if (!nameValidation.valid || !ageValidation.valid) {
      setErrors({
        name: nameValidation.error || '',
        age: ageValidation.error || '',
      });
      setIsValid({
        name: nameValidation.valid,
        age: ageValidation.valid,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await childrenRepository.create({
        name: formData.name,
        age: parseInt(finalAge, 10),
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
        postcode: formData.postcode || undefined,
        city: formData.city || undefined,
        region: formData.region || undefined,
      });
      
      // Call success callback
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add child';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (field: string) => {
    const baseClass = 'block w-full px-3 py-2.5 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200';
    
    if (touched[field]) {
      if (errors[field]) {
        return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-200`;
      }
      if (isValid[field]) {
        return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-200`;
      }
    }
    return `${baseClass} border-gray-300 focus:border-blue-500 focus:ring-blue-200`;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add child"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} />
              {errors.submit}
            </p>
          </div>
        )}

        {/* Short helper */}
        <p className="text-xs text-gray-600">
          We just need a few details to add your child to your account.
        </p>

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Emma Smith"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={getInputClassName('name')}
            />
            {touched.name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.name ? (
                  <AlertCircle className="text-red-500" size={18} />
                ) : isValid.name ? (
                  <CheckCircle className="text-green-500" size={18} />
                ) : null}
              </div>
            )}
          </div>
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.name}
            </p>
          )}
        </div>

        {/* Date of Birth & Age Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-800 mb-1">
              Date of birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_of_birth"
              id="date_of_birth"
              required
              max={new Date().toISOString().split('T')[0]}
              value={formData.date_of_birth}
              onChange={handleChange}
              onBlur={() => handleBlur('date_of_birth')}
              className={getInputClassName('date_of_birth')}
            />
            {touched.date_of_birth && errors.date_of_birth && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.date_of_birth}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-800 mb-1">
              Age <span className="text-[11px] text-gray-400">(calculated from date of birth)</span>
            </label>
            <input
              type="number"
              name="age"
              id="age"
              value={formData.age}
              readOnly
              disabled
              className="block w-full px-3 py-2.5 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-not-allowed"
            />
            {formData.age && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={10} />
                {formData.age} {formData.age === '1' ? 'year' : 'years'} old
              </p>
            )}
          </div>
        </div>

        {/* Gender - always visible */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-800 mb-1">
            Gender
          </label>
          <select
            name="gender"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say (explicit)</option>
          </select>
        </div>

        {/* Address - same as parent checkbox + lookup */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Address
          </label>
          {parentAddress && (parentAddress.address || parentAddress.postcode) && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressSameAsParent}
                  onChange={handleAddressSameAsParentChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-describedby="address-same-desc"
                />
                <span className="text-sm text-gray-700">Same as parent address</span>
              </label>
              <p id="address-same-desc" className="text-xs text-gray-500">
                Use your account address for this child.
              </p>
            </>
          )}
          {addressSameAsParent && parentAddress ? (
            <div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
              {[parentAddress.address, parentAddress.postcode, parentAddress.region].filter(Boolean).join(', ') || 'Parent address'}
            </div>
          ) : (
            <PostcodeLookup
              onAddressSelect={handleAddressSelect}
              initialAddress={
                formData.postcode
                  ? {
                      fullAddress: formData.address || '',
                      line1: formData.address || '',
                      postcode: formData.postcode,
                      city: formData.city || undefined,
                      region: formData.region || undefined,
                    }
                  : undefined
              }
            />
          )}
        </div>

        {/* Action Buttons + subtle next-step hint */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
            icon={<UserPlus size={16} />}
          >
            {isSubmitting ? 'Adding...' : 'Add Child'}
          </Button>
          </div>
          <p className="text-[11px] text-gray-500">
            After adding a child, they will appear as <span className="font-medium">pending</span>. You can complete their checklist whilst waiting for approval.
          </p>
        </div>
      </form>
    </BaseModal>
  );
}
