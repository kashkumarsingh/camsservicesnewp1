'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import { validateFullName, validateAge } from '@/utils/validation';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import PostcodeLookup from '@/components/booking/lookups/PostcodeLookup';

export default function AddChildPageClient() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refresh } = useAuth();

  const parentAddress = user?.address || user?.postcode
    ? { address: user?.address ?? '', postcode: user?.postcode ?? '', region: user?.county ?? '' }
    : null;

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    date_of_birth: '',
    gender: '' as 'male' | 'female' | 'other' | 'prefer_not_to_say' | '',
    address: '',
    postcode: '',
    city: '',
    region: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<{ address: string; city: string; region: string } | null>(null);
  const [addressSameAsParent, setAddressSameAsParent] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/children/add');
    }
  }, [authLoading, isAuthenticated, router]);

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

  // Update form when postcode lookup returns address
  useEffect(() => {
    if (addressData) {
      setFormData(prev => ({
        ...prev,
        address: addressData.address,
        city: addressData.city,
        region: addressData.region,
      }));
    }
  }, [addressData]);

  const handleAddressSameAsParentChange = () => {
    const next = !addressSameAsParent;
    setAddressSameAsParent(next);
    if (next && parentAddress) {
      setFormData(prev => ({
        ...prev,
        address: parentAddress.address,
        postcode: parentAddress.postcode,
        region: parentAddress.region,
        city: '',
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
  };

  // Calculate age from date of birth
  const calculateAgeFromDOB = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 && age <= 25 ? age : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        // Mark age as touched since it was auto-filled
        setTouched(prev => ({ ...prev, age: true, [name]: true }));
        return;
      }
    }
    
    // Age is read-only, so don't allow manual changes
    if (name === 'age') {
      return; // Ignore manual age changes - it's auto-calculated from DOB
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

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
      setErrors({
        name: nameValidation.error || '',
        date_of_birth: 'Date of birth is required',
      });
      setIsValid({
        name: nameValidation.valid,
        date_of_birth: false,
      });
      setIsSubmitting(false);
      return;
    }

    // Ensure age is calculated from DOB
    if (!formData.age) {
      const calculatedAge = calculateAgeFromDOB(formData.date_of_birth);
      if (calculatedAge !== null) {
        setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
      } else {
        setErrors({
          name: nameValidation.error || '',
          age: 'Unable to calculate age from date of birth',
        });
        setIsValid({
          name: nameValidation.valid,
          age: false,
        });
        setIsSubmitting(false);
        return;
      }
    }

    const ageValidation = validateAge(formData.age);
    if (!nameValidation.valid || !ageValidation.valid) {
      setErrors({
        name: nameValidation.error || '',
        age: ageValidation.error || '',
      });
      setIsValid({
        name: nameValidation.valid,
        age: ageValidation.valid,
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await childrenRepository.create({
        name: formData.name,
        age: parseInt(formData.age, 10),
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
        postcode: formData.postcode || undefined,
        city: formData.city || undefined,
        region: formData.region || undefined,
      });
      
      // Refresh children list
      await refresh();
      
      // Redirect to dashboard with success message
      router.push('/dashboard/parent?childAdded=true');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add child';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading form">
          <div className="mb-6 h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="bg-white rounded-[30px] p-8 shadow-2xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900/50 space-y-6">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-full max-w-sm bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[30px] p-8 shadow-2xl border border-gray-200">
          <div className="mb-8">
            <Link href="/dashboard/parent" className="text-[#0080FF] hover:text-[#0069cc] text-sm font-semibold mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-heading font-bold text-[#1E3A5F] mb-2">Add Child</h1>
            <p className="text-lg text-[#1E3A5F]/80">Add a child to your account</p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.submit}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  minLength={2}
                  maxLength={200}
                  pattern="[a-zA-Z][a-zA-Z '-]{1,} +[a-zA-Z][a-zA-Z '-]{1,}"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="Emma Smith"
                  className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.name
                      ? errors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.name
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                {touched.name && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.name ? (
                      <AlertCircle className="text-red-500" size={20} />
                    ) : isValid.name ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                  Date of Birth * <span className="text-xs font-normal text-gray-500">- Auto-calculates age</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date_of_birth"
                    id="date_of_birth"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    onBlur={() => handleBlur('date_of_birth')}
                    className={`block w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                      touched.date_of_birth
                        ? errors.date_of_birth
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : formData.date_of_birth
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                          : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                    }`}
                  />
                  {touched.date_of_birth && formData.date_of_birth && !errors.date_of_birth && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                  )}
                </div>
                {touched.date_of_birth && errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.date_of_birth}
                  </p>
                )}
                {formData.date_of_birth && formData.age && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Age automatically calculated: {formData.age} {formData.age === '1' ? 'year' : 'years'} old
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                  Age <span className="text-xs font-normal text-gray-500">(Auto-calculated from DOB - read-only)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min={0}
                    max={25}
                    inputMode="numeric"
                    value={formData.age}
                    readOnly
                    disabled
                    className="block w-full px-4 py-3 pr-10 text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm cursor-not-allowed"
                  />
                  {formData.age && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                  )}
                </div>
                {!formData.date_of_birth && (
                  <p className="mt-1 text-xs text-gray-500">
                    Age will be automatically calculated when you enter the date of birth
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-[#0080FF] focus:ring-[#0080FF] transition-all duration-200"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer Not to Say</option>
              </select>
            </div>

            {/* Address - same as parent checkbox + lookup */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                Address
              </label>
              {parentAddress && (parentAddress.address || parentAddress.postcode) && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressSameAsParent}
                      onChange={handleAddressSameAsParentChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#0080FF] focus:ring-[#0080FF]"
                      aria-describedby="address-same-desc-page"
                    />
                    <span className="text-sm text-[#1E3A5F]">Same as parent address</span>
                  </label>
                  <p id="address-same-desc-page" className="text-xs text-gray-500 mb-2">
                    Use your account address for this child.
                  </p>
                </>
              )}
              {addressSameAsParent && parentAddress ? (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {[parentAddress.address, parentAddress.postcode, parentAddress.region].filter(Boolean).join(', ') || 'Parent address'}
                </div>
              ) : (
                <PostcodeLookup
                  onAddressSelect={(data) => {
                    setAddressData({
                      address: data.fullAddress || data.line1 || '',
                      city: data.city || data.town || '',
                      region: data.region || data.county || '',
                    });
                    setFormData(prev => ({
                      ...prev,
                      postcode: data.postcode || prev.postcode,
                      address: data.fullAddress || data.line1 || prev.address,
                      city: data.city || data.town || prev.city,
                      region: data.region || data.county || prev.region,
                    }));
                  }}
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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/parent')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Adding Child...' : 'Add Child'}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> After adding a child, they will be pending admin approval. 
              You can complete their checklist while waiting for approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

