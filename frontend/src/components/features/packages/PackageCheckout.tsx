'use client';

/**
 * Single-Page Package Checkout Component
 * 
 * Clean Architecture Layer: Presentation (UI Components)
 * Purpose: Simplified single-page checkout for package purchases
 * 
 * Replaces the multi-step wizard with a streamlined checkout experience:
 * - Child selection (radio buttons, hide children with active packages)
 * - Package summary (non-editable, pre-filled)
 * - Consent checkbox
 * - Stripe payment form
 * - Single "Complete Purchase" button
 * 
 * @component
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Package, CheckCircle2, AlertCircle, Lock, Loader2, ArrowLeft, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import PaymentForm from '@/components/booking/payment/PaymentForm';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import type { Child } from '@/core/application/auth/types';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { formatCurrency } from '@/utils/currencyFormatter';
import type { PaymentMethod, PaymentStatus } from '@/infrastructure/services/payment';
import { parentProfileRepository } from '@/infrastructure/http/parent/ParentProfileRepository';
import { ROUTES } from '@/utils/routes';

interface PackageCheckoutProps {
  packageName: string;
  packageSlug: string;
  packageId: number;
  packagePrice: number;
  totalHours: number;
  initialChildId?: number | null;
}

export default function PackageCheckout({
  packageName,
  packageSlug,
  packageId,
  packagePrice,
  totalHours,
  initialChildId = null,
}: PackageCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Check if child was pre-selected from URL (locked selection)
  const childIdFromUrl = searchParams.get('childId');
  const isChildLocked = !!childIdFromUrl && initialChildId !== null;
  
  const [selectedChildId, setSelectedChildId] = useState<number | null>(initialChildId);
  const [approvedChildren, setApprovedChildren] = useState<Child[]>([]);
  const [childrenWithActivePackages, setChildrenWithActivePackages] = useState<Map<number, { packageName: string; expiresAt: string | null }>>(new Map());
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [tempBookingId, setTempBookingId] = useState<string | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<{ id: string; reference: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ child?: string; consent?: string; parent?: { firstName?: string; lastName?: string; email?: string; phone?: string } }>({});
  
  // Parent information form state (pre-filled from user profile)
  const [parentFirstName, setParentFirstName] = useState<string>('');
  const [parentLastName, setParentLastName] = useState<string>('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [updateProfile, setUpdateProfile] = useState<boolean>(false);
  
  // Ref to prevent multiple simultaneous booking creation attempts
  const isCreatingBookingRef = useRef(false);
  
  // Track if fields have been manually edited (to preserve user edits)
  const [fieldsInitialized, setFieldsInitialized] = useState(false);
  
  // Initialize parent form fields from user profile when user loads
  useEffect(() => {
    if (user && !fieldsInitialized) {
      const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean);
      setParentFirstName(nameParts[0] || '');
      setParentLastName(nameParts.slice(1).join(' ') || '');
      setParentEmail(user.email || '');
      setParentPhone(user.phone || '');
      setFieldsInitialized(true);
    }
  }, [user, fieldsInitialized]);

  // Fetch approved children and check for active packages
  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      try {
        const children = await childrenRepository.list();
        const approved = children.filter(child => child.approvalStatus === 'approved');
        setApprovedChildren(approved);

        // Check for active packages for each child (with expiry dates)
        const childrenWithActive = new Map<number, { packageName: string; expiresAt: string | null }>();
        await Promise.all(
          approved.map(async (child) => {
            try {
              const response = await apiClient.get<{
                child_id: string;
                child_name: string;
                active_bookings: Array<{
                  id: number;
                  reference: string;
                  package: { id: number | string; name: string };
                  status: string;
                  payment_status: string;
                  package_expires_at: string | null;
                }>;
                count: number;
              }>(API_ENDPOINTS.CHILD_ACTIVE_BOOKINGS(child.id));

              if (response.data?.active_bookings && Array.isArray(response.data.active_bookings)) {
                const activeBooking = response.data.active_bookings[0]; // Get first active booking
                if (activeBooking) {
                  childrenWithActive.set(child.id, {
                    packageName: activeBooking.package?.name || 'Package',
                    expiresAt: activeBooking.package_expires_at,
                  });
                }
              }
            } catch (error) {
              // Silently fail - don't block child selection if check fails
              if (process.env.NODE_ENV === 'development') {
                console.warn(`[PackageCheckout] Failed to check active bookings for child ${child.id}:`, error);
              }
            }
          })
        );
        setChildrenWithActivePackages(childrenWithActive);

        // Auto-select initial child if provided and available
        if (initialChildId) {
          if (childrenWithActive.has(initialChildId)) {
            // Child from URL has active package - clear selection and show error
            setSelectedChildId(null);
            const activePackageInfo = childrenWithActive.get(initialChildId);
            const childName = approved.find(c => c.id === initialChildId)?.name || 'this child';
            const packageName = activePackageInfo?.packageName || 'a package';
            const expiresAt = activePackageInfo?.expiresAt 
              ? new Date(activePackageInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'No expiry set';
            
            setPaymentError(
              `Child '${childName}' already has an active package (${packageName}). ` +
              `Each child can only have one active package at a time. ` +
              `The current package expires on ${expiresAt}. ` +
              `Please complete or cancel the existing package, or wait until it expires before booking a new package.`
            );
          } else if (approved.some(c => c.id === initialChildId)) {
            // Child is available - select them
            setSelectedChildId(initialChildId);
          }
        } else if (approved.length > 0 && !selectedChildId && !isChildLocked) {
          // Auto-select first available child (only if not locked from URL)
          const firstAvailable = approved.find(c => !childrenWithActive.has(c.id));
          if (firstAvailable) {
            setSelectedChildId(firstAvailable.id);
          }
        }
      } catch (error) {
        console.error('[PackageCheckout] Failed to fetch children:', error);
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [initialChildId]);

  // Create temporary booking for payment (required for payment intent)
  useEffect(() => {
    const createTempBooking = async () => {
      // Guard: prevent multiple simultaneous calls
      // Also check if selected child has active package (prevent backend call)
      if (
        availableChildren.length === 0 ||
        tempBookingId ||
        !selectedChildId ||
        !user ||
        isCreatingBookingRef.current ||
        isCreatingBooking ||
        paymentStatus === 'completed' ||
        childrenWithActivePackages.has(selectedChildId) // Prevent booking if child has active package
      ) {
        // If child has active package, set error message
        if (selectedChildId && childrenWithActivePackages.has(selectedChildId)) {
          const activePackageInfo = childrenWithActivePackages.get(selectedChildId);
          const childName = approvedChildren.find(c => c.id === selectedChildId)?.name || 'this child';
          const packageName = activePackageInfo?.packageName || 'a package';
          const expiresAt = activePackageInfo?.expiresAt 
            ? new Date(activePackageInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'No expiry set';
          
          setPaymentError(
            `Child '${childName}' already has an active package (${packageName}). ` +
            `Each child can only have one active package at a time. ` +
            `The current package expires on ${expiresAt}. ` +
            `Please complete or cancel the existing package, or wait until it expires before booking a new package.`
          );
        }
        return;
      }

      // Set ref and state to prevent re-entry
      isCreatingBookingRef.current = true;
      setIsCreatingBooking(true);
      setPaymentError(null);

      try {
        // Get parent details from form state (pre-filled from user profile)
        const parentFirstNameValue = parentFirstName || (user.name || '').split(' ')[0] || 'Parent';
        const parentLastNameValue = parentLastName || (user.name || '').split(' ').slice(1).join(' ') || 'Parent';
        const parentEmailValue = parentEmail || user.email || '';
        const parentPhoneValue = parentPhone || (user.phone ?? '');
        const parentAddress = user.address ?? '';
        const parentPostcode = user.postcode ?? '';
        const parentCounty = user.county ?? '';

        // Get selected child details
        const selectedChild = approvedChildren.find(c => c.id === selectedChildId);
        if (!selectedChild) {
          throw new Error('Selected child not found');
        }

        // Child may have camelCase from API; support both for payload
        const childPayload = selectedChild as Child & {
          dateOfBirth?: string;
          medical_info?: string | null;
          medicalInfo?: string | null;
          special_needs?: string | null;
          specialNeeds?: string | null;
        };
        const childRawName = childPayload.name ?? '';
        const childNameParts = childRawName.trim().split(/\s+/).filter(Boolean);
        const childFirstName = childNameParts[0] ?? childRawName ?? 'Child';
        const childLastName = childNameParts.slice(1).join(' ') || childFirstName || 'Child';

        const rawDob = childPayload.date_of_birth ?? childPayload.dateOfBirth ?? null;
        let dobDate: Date;
        if (rawDob) {
          dobDate = new Date(rawDob);
        } else {
          const childAge = childPayload.age ?? 0;
          dobDate = new Date();
          dobDate.setFullYear(dobDate.getFullYear() - childAge);
        }
        if (isNaN(dobDate.getTime())) {
          dobDate = new Date();
          dobDate.setFullYear(2010);
        }
        const dobString = dobDate.toISOString().split('T')[0];

        const medicalInfo = childPayload.medicalInfo ?? childPayload.medical_info ?? null;
        const specialNeeds = childPayload.specialNeeds ?? childPayload.special_needs ?? null;

        const bookingData = {
          package_id: packageId,
          user_id: user.id ?? null,
          parent_first_name: parentFirstNameValue,
          parent_last_name: parentLastNameValue,
          parent_email: parentEmailValue,
          parent_phone: parentPhoneValue,
          parent_address: parentAddress || null,
          parent_postcode: parentPostcode || null,
          parent_county: parentCounty || null,
          status: 'draft',
          payment_status: 'pending',
          mode_key: 'sessions',
          participants: [
            {
              child_id: selectedChildId,
              first_name: childFirstName,
              last_name: childLastName,
              date_of_birth: dobString,
              medical_info: medicalInfo,
              special_needs: specialNeeds,
            },
          ],
        };

        // Development-only logging to verify payload before API call
        if (process.env.NODE_ENV === 'development') {
           
          console.log(
            '[PackageCheckout] Temporary booking payload:',
            bookingData,
          );
        }

        const response = await apiClient.post<{
          id: string;
          reference: string;
          status: string;
        }>(API_ENDPOINTS.BOOKINGS, bookingData);

        if (response.data?.id) {
          setTempBookingId(response.data.id);
        } else {
          throw new Error('Failed to create booking');
        }
      } catch (error: any) {
        // Log detailed error information for debugging
        console.error('[PackageCheckout] Failed to create temporary booking:', {
          error,
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : [],
          responseStatus: error?.response?.status,
          responseData: error?.response?.data,
          responseHeaders: error?.response?.headers,
          requestUrl: error?.config?.url,
          requestMethod: error?.config?.method,
          requestData: error?.config?.data,
          message: error?.message,
          stack: error?.stack,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        });
        
        // Extract error message from API response
        let errorMessage = 'Failed to create booking. Please try again.';
        
        // ApiClient unwraps responses, so check multiple possible error structures
        if (error?.response?.data) {
          const errorData = error.response.data;
          
          // Handle validation errors (422)
          if (errorData.errors && typeof errorData.errors === 'object') {
            const validationErrors: string[] = [];
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                validationErrors.push(...messages);
              } else if (typeof messages === 'string') {
                validationErrors.push(messages);
              }
            });
            
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join('. ');
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else if (error?.data) {
          // ApiClient might unwrap the response
          const errorData = error.data;
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors) {
            // Handle unwrapped validation errors
            const validationErrors: string[] = [];
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                validationErrors.push(...messages);
              } else if (typeof messages === 'string') {
                validationErrors.push(messages);
              }
            });
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join('. ');
            }
          }
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        console.error('[PackageCheckout] Extracted error message:', errorMessage);
        setPaymentError(errorMessage);
      } finally {
        // Always reset ref and state
        isCreatingBookingRef.current = false;
        setIsCreatingBooking(false);
      }
    };

    if (selectedChildId && user && !tempBookingId && !isCreatingBookingRef.current && !isCreatingBooking) {
      createTempBooking();
    }
    // Only re-run when these specific values change (not approvedChildren array reference)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId, user, tempBookingId, packageId, packageSlug, paymentStatus]);

  // Handle payment completion
  const handlePaymentComplete = async (method: PaymentMethod, transactionId: string) => {
    if (!selectedChildId || !user) {
      setPaymentError('Missing required information');
      return;
    }

    try {
      setPaymentStatus('processing');

      // Get selected child details
      const selectedChild = approvedChildren.find(c => c.id === selectedChildId);
      if (!selectedChild) {
        throw new Error('Selected child not found');
      }

      // Use parent form fields (pre-filled from user profile)
      const parentFirstNameValue = parentFirstName || (user.name || '').split(' ')[0] || '';
      const parentLastNameValue = parentLastName || (user.name || '').split(' ').slice(1).join(' ') || '';

      // Split child name into first and last name
      const childNameParts = (selectedChild.name || '').trim().split(/\s+/);
      const childFirstName = childNameParts[0] || selectedChild.name || '';
      const childLastName = childNameParts.slice(1).join(' ') || '';

      // Call createAfterPayment endpoint to create confirmed booking
      const response = await apiClient.post<{
        success: boolean;
        data: {
          id: string;
          reference: string;
          status: string;
          paymentStatus: string;
        };
        message?: string;
      }>(API_ENDPOINTS.CREATE_BOOKING_AFTER_PAYMENT, {
        package_id: packageId,
        payment_intent_id: transactionId, // Stripe payment intent ID
        parent_first_name: parentFirstNameValue,
        parent_last_name: parentLastNameValue,
        parent_email: parentEmail || user.email || '',
        parent_phone: parentPhone || (user as any).phone || '',
        parent_address: user.address || null,
        parent_postcode: user.postcode || null,
        parent_county: user.county || null,
        participants: [{
          child_id: selectedChildId,
          first_name: childFirstName,
          last_name: childLastName,
          age: selectedChild.age || null,
          order: 1,
        }],
        start_date: null,
        package_expires_at: null,
        hours_expires_at: null,
        mode_key: 'sessions', // Default to sessions mode for package purchase
      });

      if (response.data.success && response.data.data) {
        const booking = response.data.data;
        setCreatedBooking({
          id: booking.id,
          reference: booking.reference,
        });
        setPaymentStatus('completed');

        // Update profile if checkbox is checked
        if (updateProfile) {
          try {
            const fullName = `${parentFirstName} ${parentLastName}`.trim();
            await parentProfileRepository.updateProfile({
              name: fullName || user.name || '',
              phone: parentPhone || (user as any)?.phone || null,
              // Note: Email cannot be updated via profile API (backend restriction)
              // Address and postcode are not collected in this form, so we don't update them
            });
          } catch (profileError) {
            // Log error but don't block booking success
            console.error('[PackageCheckout] Failed to update profile:', profileError);
            // Profile update failure doesn't affect booking success
          }
        }

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/parent?purchase=success');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to create booking after payment');
      }
    } catch (error: any) {
      console.error('[PackageCheckout] Failed to create booking after payment:', error);
      setPaymentError(error.message || 'Payment succeeded but booking creation failed. Please contact support.');
      setPaymentStatus('failed');
    }
  };

  const handlePaymentFailed = (method: PaymentMethod, error: string) => {
    setPaymentError(error);
    setPaymentStatus('failed');
  };

  // Filter children with active packages BEFORE showing selection
  const availableChildren = approvedChildren.filter(child => !childrenWithActivePackages.has(child.id));
  const unavailableChildren = approvedChildren.filter(child => childrenWithActivePackages.has(child.id));
  const canProceed = selectedChildId && consentGiven && tempBookingId && !isCreatingBooking && paymentStatus === 'pending';

  // Format expiry date
  const formatExpiryDate = (expiresAt: string | null): string => {
    if (!expiresAt) return 'No expiry';
    try {
      const date = new Date(expiresAt);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  // Validate before proceeding to payment
  const validateForm = (): boolean => {
    const errors: { child?: string; consent?: string } = {};
    
    if (!selectedChildId) {
      errors.child = 'Please select a child before continuing';
    }
    
    if (!consentGiven) {
      errors.consent = 'You must agree to the consent terms to proceed';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle payment button click (validate first)
  const handlePaymentClick = () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-validation-error]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    // PaymentForm will handle the actual payment
  };

  // Get selected child details for order summary
  const selectedChild = approvedChildren.find(c => c.id === selectedChildId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={ROUTES.PACKAGES} 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            <span>Back to Packages</span>
          </Link>
          <div className="flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Complete Your Purchase
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {packageName} • {formatCurrency(packagePrice)}
          </p>
        </div>

        {/* Two-Column Layout (Desktop) / Single Column (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Form Sections (60% on desktop) */}
          <div className="lg:col-span-2 space-y-6">

            {/* SECTION 1: Your Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Information</h2>
              <p className="text-xs text-gray-500 mb-4">
                These details are from your profile. Edit if needed.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={parentFirstName}
                      onChange={(e) => setParentFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={parentLastName}
                      onChange={(e) => setParentLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-start gap-1 mt-2">
                  <span>💡</span>
                  <span>We'll use this email to send your booking confirmation</span>
                </p>
                
                {/* Update Profile Checkbox - Only show if fields have changed */}
                {(() => {
                  const userFirstName = (user?.name || '').split(' ')[0] || '';
                  const userLastName = (user?.name || '').split(' ').slice(1).join(' ') || '';
                  const userPhone = (user as any)?.phone || '';
                  
                  const hasChanges = 
                    (parentFirstName.trim() !== userFirstName.trim()) ||
                    (parentLastName.trim() !== userLastName.trim()) ||
                    (parentPhone.trim() !== userPhone.trim());
                  
                  return hasChanges ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="flex items-start gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={updateProfile}
                          onChange={(e) => setUpdateProfile(e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          <span className="font-medium">Update my profile</span> with these changes
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Note: Email changes apply to this booking only. Contact support to update your account email.
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* SECTION 2: Who Is This For */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-validation-error={validationErrors.child ? 'true' : undefined}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Who Is This For?</h2>

              {loadingChildren ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <span className="ml-3 text-gray-600">Loading children...</span>
                </div>
              ) : isChildLocked && selectedChildId ? (
                // Locked child selection (from URL param)
                // Check if this child has an active package
                childrenWithActivePackages.has(selectedChildId) ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      <div className="flex-1">
                        <div className="font-semibold text-red-900 mb-1">
                          {selectedChild?.name || 'Selected Child'} - Active Package Detected
                        </div>
                        <div className="text-sm text-red-700 mb-2">
                          {(() => {
                            const activePackageInfo = childrenWithActivePackages.get(selectedChildId);
                            const packageName = activePackageInfo?.packageName || 'a package';
                            const expiresAt = activePackageInfo?.expiresAt 
                              ? new Date(activePackageInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'No expiry set';
                            return `This child already has an active package (${packageName}) that expires on ${expiresAt}.`;
                          })()}
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                          Each child can only have one active package at a time. Please complete or cancel the existing package, or wait until it expires before booking a new package.
                        </p>
                        <Link
                          href="/dashboard/parent"
                          className="mt-3 inline-block text-xs font-semibold text-red-700 hover:text-red-900 underline"
                        >
                          View Dashboard to Manage Packages →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="text-blue-600" size={20} />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {selectedChild?.name || 'Selected Child'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedChild ? `Age ${selectedChild.age} • ${selectedChild.gender === 'male' ? 'Male' : selectedChild.gender === 'female' ? 'Female' : 'Other'}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : availableChildren.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">No Available Children</p>
                      <p className="text-xs text-yellow-700">
                        {approvedChildren.length === 0
                          ? 'You need to add and approve children before purchasing packages.'
                          : 'All your approved children already have active packages. Please wait for their current package to expire before purchasing a new one.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Available Children */}
                  <div className="space-y-3">
                    {availableChildren.map((child) => (
                      <label
                        key={child.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedChildId === child.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="child"
                          value={child.id}
                          checked={selectedChildId === child.id}
                          onChange={() => {
                            setSelectedChildId(child.id);
                            setValidationErrors(prev => ({ ...prev, child: undefined }));
                            // Clear payment error when selecting a different child (if they don't have active package)
                            if (paymentError && !childrenWithActivePackages.has(child.id)) {
                              setPaymentError(null);
                            }
                          }}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{child.name}</div>
                          <div className="text-sm text-gray-600">
                            Age {child.age} • {child.gender === 'male' ? 'Male' : child.gender === 'female' ? 'Female' : 'Other'}
                          </div>
                        </div>
                        {selectedChildId === child.id && (
                          <CheckCircle2 className="text-blue-600" size={20} />
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Validation Error */}
                  {validationErrors.child && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-red-700">{validationErrors.child}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              {selectedChild && (
                <p className="text-xs text-gray-500 flex items-start gap-1 mt-3">
                  <span>💡</span>
                  <span>You can book sessions for this child after purchase</span>
                </p>
              )}
            </div>

            {/* SECTION 3: Agreement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-validation-error={validationErrors.consent ? 'true' : undefined}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Agreement</h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => {
                      setConsentGiven(e.target.checked);
                      setValidationErrors(prev => ({ ...prev, consent: undefined }));
                    }}
                    className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to CAMS handling travel, supervision, and logistics for my child's sessions. I understand that I will book specific sessions after this purchase is complete.
                  </span>
                </label>
                {/* Validation Error */}
                {validationErrors.consent && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-red-700">{validationErrors.consent}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Payment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-blue-600" />
                Payment Method
              </h2>
              {availableChildren.length === 0 ? (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-gray-500 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Payment Unavailable</p>
                      <p className="text-xs text-gray-700">
                        All your approved children already have active packages. You can purchase another package
                        once an existing package has finished, or return to the packages page to choose a different option.
                      </p>
                    </div>
                  </div>
                </div>
              ) : isCreatingBooking ? (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="text-blue-600 animate-spin" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Preparing Checkout</p>
                      <p className="text-xs text-blue-700 mt-1">Setting up your secure payment...</p>
                    </div>
                  </div>
                </div>
              ) : paymentError ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-1">
                        {paymentError.includes('already has an active package') 
                          ? 'Active Package Detected' 
                          : 'Payment Error'}
                      </p>
                      <p className="text-xs text-red-700 mb-3">{paymentError}</p>
                      {paymentError.includes('already has an active package') ? (
                        <div className="space-y-2">
                          <Link
                            href="/dashboard/parent"
                            className="block text-xs font-semibold text-red-700 hover:text-red-900 underline"
                          >
                            View Dashboard to Manage Packages →
                          </Link>
                          {availableChildren.length > 0 && (
                            <button
                              onClick={() => {
                                setPaymentError(null);
                                setSelectedChildId(null);
                                setTempBookingId(null);
                              }}
                              className="block text-xs font-semibold text-red-700 hover:text-red-900 underline"
                            >
                              Select a Different Child
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => window.location.reload()}
                          className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
                        >
                          Refresh page to try again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : tempBookingId ? (
                <PaymentForm
                  bookingId={tempBookingId}
                  amount={packagePrice}
                  onPaymentComplete={handlePaymentComplete}
                  onPaymentFailed={handlePaymentFailed}
                  disabled={!canProceed || paymentStatus !== 'pending'}
                  externalPaymentStatus={paymentStatus}
                />
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="text-gray-600 animate-spin" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Initializing Payment</p>
                      <p className="text-xs text-gray-700 mt-1">Please wait while we prepare your checkout...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary (40% on desktop, sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="text-blue-600" size={20} />
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Package</div>
                    <div className="font-semibold text-gray-900">{packageName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Hours</div>
                    <div className="font-semibold text-gray-900">{totalHours} hours of training</div>
                  </div>
                  {selectedChild && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">For</div>
                      <div className="font-semibold text-gray-900">
                        {selectedChild.name} (Age {selectedChild.age})
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(packagePrice)}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="text-green-600" size={16} />
                      <span>🔒 Secure payment - Your card details are never stored</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Helper Text */}
        {tempBookingId && paymentStatus === 'pending' && !isCreatingBooking && !canProceed && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-1">Complete Required Fields</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  {!selectedChildId && <li>• Please select a child</li>}
                  {!consentGiven && <li>• Please agree to the consent terms</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Payment Success Message */}
        {paymentStatus === 'completed' && createdBooking && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1">Purchase Successful!</p>
                <p className="text-xs text-green-700">
                  Your booking reference: <strong>{createdBooking.reference}</strong>
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Redirecting to dashboard to book sessions...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
