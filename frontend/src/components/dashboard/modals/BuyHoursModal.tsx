"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Package, Loader2, AlertCircle, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { BaseModal } from "@/components/ui/Modal";
import type { Child, User } from "@/core/application/auth/types";
import type { PackageDTO } from "@/core/application/packages/dto/PackageDTO";
import type { BookingDTO } from "@/core/application/booking/dto/BookingDTO";
import MiniPackageCard from "./MiniPackageCard";
import { packageRepository } from "@/infrastructure/persistence/packages";
import { ListPackagesUseCase } from "@/core/application/packages/useCases/ListPackagesUseCase";
import { apiClient } from "@/infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "@/infrastructure/http/apiEndpoints";
import { getChildColor } from "@/utils/childColorUtils";

interface BuyHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  children?: Child[]; // All approved children for selector
  bookings?: BookingDTO[]; // Bookings to calculate hours remaining
  user?: User | null;
  onConfirm?: () => void; // Optional - kept for backward compatibility
  onDraftBookingCreated?: (booking: BookingDTO) => void;
  /** When child already has an active package: open top-up flow (add hours + pay) for this child */
  onOpenTopUp?: (childId: number) => void;
  /** When set (e.g. from public package page redirect), scroll this package into view when packages load */
  initialPackageSlug?: string | null;
}

/**
 * Buy Hours Modal (Parent Dashboard)
 *
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Instant package purchase modal with mini package selection.
 * Location: frontend/src/components/dashboard/modals/BuyHoursModal.tsx
 */
export default function BuyHoursModal({
  isOpen,
  onClose,
  child,
  children = [],
  bookings = [],
  user = null,
  onConfirm,
  onDraftBookingCreated,
  onOpenTopUp,
  initialPackageSlug = null,
}: BuyHoursModalProps) {
  const router = useRouter();

  // Track children with active packages (to filter them out)
  // Declare this BEFORE useMemo hooks that depend on it
  const [childrenWithActivePackages, setChildrenWithActivePackages] = useState<Map<number, { packageName: string; expiresAt: string | null }>>(new Map());
  const [loadingActivePackages, setLoadingActivePackages] = useState(false);
  
  // Calculate hours for each child (similar to DashboardRightSidebar)
  const childrenWithHours = React.useMemo(() => {
    const confirmedPaidBookings = bookings.filter(
      b => b.status === 'confirmed' && b.paymentStatus === 'paid'
    );

    return children.map(child => {
      // Find active booking for this child (most recent)
      const childBookings = confirmedPaidBookings.filter(b => {
        if (!b.participants) return false;
        return b.participants.some(p => p.childId === child.id);
      });

      let activeBooking = null;
      if (childBookings.length > 0) {
        const sorted = [...childBookings].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        activeBooking = sorted[0];
      }

      const totalHours = activeBooking?.totalHours || 0;
      const bookedHours = activeBooking?.bookedHours || 0;
      const remainingHours = totalHours - bookedHours;

      return {
        child,
        remainingHours,
        totalHours,
        bookedHours,
        hasPackage: activeBooking !== null,
      };
    });
  }, [children, bookings]);

  // Filter children: Only show those WITHOUT active packages
  const availableChildren = React.useMemo(() => {
    return childrenWithHours.filter(c => !childrenWithActivePackages.has(c.child.id));
  }, [childrenWithHours, childrenWithActivePackages]);
  
  // Get unavailable children (with active packages) for display
  const unavailableChildren = React.useMemo(() => {
    return childrenWithHours.filter(c => childrenWithActivePackages.has(c.child.id));
  }, [childrenWithHours, childrenWithActivePackages]);
  
  // Group available children by urgency: 0 hours (critical) vs has hours (sufficient)
  const groupedChildren = React.useMemo(() => {
    const needsHours = availableChildren.filter(c => c.remainingHours <= 0);
    const sufficientHours = availableChildren.filter(c => c.remainingHours > 0);

    // Sort within groups: 0 hours first (already filtered), then by remaining hours (lowest first)
    const sortedNeedsHours = needsHours.sort((a, b) => {
      if (a.remainingHours === 0 && b.remainingHours !== 0) return -1;
      if (a.remainingHours !== 0 && b.remainingHours === 0) return 1;
      return a.remainingHours - b.remainingHours; // Lowest first
    });

    const sortedSufficientHours = sufficientHours.sort((a, b) => {
      return a.remainingHours - b.remainingHours; // Lowest first
    });

    return {
      needsHours: sortedNeedsHours,
      sufficientHours: sortedSufficientHours,
    };
  }, [availableChildren]);
  
  // State for selected child (can be changed via dropdown)
  const [selectedChildId, setSelectedChildId] = useState<number | null>(child?.id ?? null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Sync selected child only when modal opens or child prop changes — do NOT run when
  // availableChildren/childrenWithActivePackages update, or we overwrite the user's dropdown choice.
  useEffect(() => {
    if (!isOpen) return;
    setSelectedPackageSlug(null);
    if (child?.id) {
      setSelectedChildId(child.id);
      setValidationError(null);
    } else {
      // No pre-selected child: require selection (user will pick from dropdown)
      setSelectedChildId(null);
    }
  }, [isOpen, child?.id]);
  
  // Auto-select when only one available child (after data loads), without overwriting user selection.
  useEffect(() => {
    if (!isOpen || child?.id) return;
    if (availableChildren.length === 1 && selectedChildId === null) {
      setSelectedChildId(availableChildren[0].child.id);
      setValidationError(null);
    }
  }, [isOpen, child?.id, availableChildren, selectedChildId]);
  
  // Get selected child object
  const selectedChild = selectedChildId 
    ? (child || children.find(c => c.id === selectedChildId) || null)
    : null;
  
  const childName = selectedChild?.name ?? "your child";
  const childId = selectedChild?.id;
  const hasMultipleChildren = children.length > 1;
  // Show child selector only when opened from top "Buy Hours" (no child pre-selected).
  // When parent clicks "Buy hours for [child name]" on a card, show that child only — no selector.
  const showChildDropdown = hasMultipleChildren && !child?.id;
  const isChildSelected = selectedChildId !== null;
  // Selected child already has an active package — show dedicated message and hide package selection
  const selectedChildHasActivePackage =
    selectedChildId !== null && childrenWithActivePackages.has(selectedChildId);

  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch packages function
  // Define this BEFORE useEffect that calls it (arrow functions are not hoisted)
  const fetchPackages = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listPackagesUseCase = new ListPackagesUseCase(packageRepository);
      // Backend already filters by is_active = true, so we don't need to filter by 'available' here
      // The backend ListPackagesAction always calls ->active() which filters by is_active = true
      const fetchedPackages = await listPackagesUseCase.execute({
        sortBy: 'price',
        sortOrder: 'asc',
      });
      // Safety check: only show active packages that can be booked (have spots and valid hours/price)
      // This ensures we don't show inactive packages even if backend filter fails
      const bookablePackages = fetchedPackages.filter(pkg => {
        // Check if package is active (if isActive field is available)
        const isActive = (pkg as any).isActive !== false; // Default to true if not provided (backend already filtered)
        // Check if package can be booked
        const canBeBooked = pkg.canBeBooked !== false;
        return isActive && canBeBooked;
      });
      setPackages(bookablePackages);
    } catch (err) {
      console.error('[BuyHoursModal] Failed to fetch packages:', err);
      setError('Unable to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for active packages for each child
  // Define this BEFORE useEffect that calls it (arrow functions are not hoisted)
  const checkActivePackages = React.useCallback(async () => {
    if (children.length === 0) return;
    
    setLoadingActivePackages(true);
    try {
      const childrenWithActive = new Map<number, { packageName: string; expiresAt: string | null }>();
      
      await Promise.all(
        children.map(async (child) => {
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

            if (response.data?.active_bookings && Array.isArray(response.data.active_bookings) && response.data.active_bookings.length > 0) {
              // Business Rule: A child can only have ONE active package at a time
              const activeBooking = response.data.active_bookings[0]; // Get first active booking
              if (activeBooking) {
                childrenWithActive.set(child.id, {
                  packageName: activeBooking.package?.name || 'Package',
                  expiresAt: activeBooking.package_expires_at,
                });
              }
            }
          } catch (error) {
            // Silently fail - don't block modal if check fails
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[BuyHoursModal] Failed to check active bookings for child ${child.id}:`, error);
            }
          }
        })
      );
      
      setChildrenWithActivePackages(childrenWithActive);
      
      // If pre-selected child has active package, clear selection only when modal was opened
      // from the top "Buy Hours" button (no child prop). When opened for a specific child,
      // keep that child selected and set a clear message so parents know why cards are disabled.
      const openedForThisChild = child?.id === selectedChildId;
      if (selectedChildId && childrenWithActive.has(selectedChildId)) {
        if (!openedForThisChild) {
          setSelectedChildId(null);
          setValidationError(
            `This child already has an active package. Each child can only have one active package at a time.`
          );
        } else {
          const activeInfo = childrenWithActive.get(selectedChildId);
          const pkgName = activeInfo?.packageName || 'a package';
          const expiresAt = activeInfo?.expiresAt
            ? new Date(activeInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'No expiry set';
          setValidationError(
            `This child already has an active package (${pkgName}, expires ${expiresAt}). Each child can only have one active package at a time.`
          );
        }
      } else if (selectedChildId && !childrenWithActive.has(selectedChildId)) {
        setValidationError(null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[BuyHoursModal] Failed to check active packages:', error);
      }
    } finally {
      setLoadingActivePackages(false);
    }
  }, [children, selectedChildId, child?.id]);
  
  // Fetch packages and check active packages when modal opens
  useEffect(() => {
    if (isOpen) {
      if (packages.length === 0) {
        fetchPackages();
      }
      checkActivePackages();
    }
  }, [isOpen, children, checkActivePackages, fetchPackages, packages.length]);

  // When packages load and initialPackageSlug is set (e.g. from public package page), scroll that package into view
  useEffect(() => {
    if (!isOpen || !initialPackageSlug || packages.length === 0) return;
    const slug = initialPackageSlug;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-package-slug="${slug}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, initialPackageSlug, packages.length]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowChildSelector(false);
      }
    };
    
    if (showChildSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showChildSelector]);

  /** User clicks "Continue to payment" – create draft and proceed. */
  const handleContinueToPayment = () => {
    if (selectedPackageSlug) {
      handlePackageSelect(selectedPackageSlug);
    }
  };

  const handlePackageSelect = async (packageSlug: string) => {
    // Validate child selection before proceeding
    if (!selectedChildId) {
      setValidationError('Please select a child first');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (childrenWithActivePackages.has(selectedChildId)) {
      const activePackageInfo = childrenWithActivePackages.get(selectedChildId);
      const childName = selectedChild?.name || 'this child';
      const packageName = activePackageInfo?.packageName || 'a package';
      const expiresAt = activePackageInfo?.expiresAt
        ? new Date(activePackageInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'No expiry set';

      setValidationError(
        `${childName} already has an active package (${packageName}). Each child can only have one active package at a time. The current package expires on ${expiresAt}. To add more hours (top-up), please use the top-up button above.`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationError(null);
    setDraftError(null);

    // Open Complete Payment modal: create draft booking then notify parent
    if (onDraftBookingCreated && user && selectedChild) {
      const pkg = packages.find((p) => p.slug === packageSlug);
      if (!pkg) {
        setDraftError('Package not found. Please try again.');
        return;
      }
      const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean);
      const parentFirstName = nameParts[0] || 'Parent';
      const parentLastName = nameParts.slice(1).join(' ') || 'Parent';
      const parentPhone = user.phone ?? '';
      if (!parentPhone) {
        setDraftError('Please add your phone number in Settings before purchasing.');
        return;
      }
      const childDob =
        selectedChild.date_of_birth ||
        (() => {
          const d = new Date();
          d.setFullYear(d.getFullYear() - (selectedChild.age ?? 0));
          return d.toISOString().split('T')[0];
        })();
      const childNameParts = (selectedChild.name || '').trim().split(/\s+/).filter(Boolean);
      const childFirstName = childNameParts[0] || 'Child';
      const childLastName = childNameParts.slice(1).join(' ') || '';

      setCreatingDraft(true);
      try {
        const response = await apiClient.post<BookingDTO>(API_ENDPOINTS.BOOKINGS, {
          package_id: parseInt(String(pkg.id), 10),
          user_id: user.id ?? null,
          parent_first_name: parentFirstName,
          parent_last_name: parentLastName,
          parent_email: user.email || '',
          parent_phone: parentPhone,
          parent_address: user.address || null,
          parent_postcode: user.postcode || null,
          parent_county: user.county || null,
          status: 'draft',
          payment_status: 'pending',
          mode_key: 'sessions',
          participants: [
            {
              child_id: selectedChildId,
              first_name: childFirstName,
              last_name: childLastName,
              date_of_birth: childDob,
              medical_info: null,
              special_needs: null,
            },
          ],
        });

        const booking = response.data;
        if (booking?.id && booking?.reference) {
          onDraftBookingCreated(booking);
          onClose();
        } else {
          setDraftError('Booking was created but response was invalid. Please check your bookings.');
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string'
            ? (err as { message: string }).message
            : 'Failed to create booking. Please try again.';
        setDraftError(msg);
      } finally {
        setCreatingDraft(false);
      }
      return;
    }

    // Fallback: package purchase is dashboard-only; close modal (parent should pass onDraftBookingCreated)
    onClose();
    router.push('/dashboard/parent');
  };
  
  const handleChildSelect = (childId: number) => {
    setSelectedChildId(childId);
    setShowChildSelector(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <CreditCard size={18} className="text-blue-600" />
          {selectedChild ? `Buy Hours for ${childName}` : 'Buy Hours'}
        </span>
      }
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <p className="text-xs text-gray-500 order-2 sm:order-1 self-center sm:self-auto">
            Secure payment · Cancel anytime · Money-back guarantee
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            {!loading && !error && packages.length > 0 && availableChildren.length > 0 && !selectedChildHasActivePackage && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={!selectedPackageSlug || creatingDraft || !isChildSelected}
                onClick={handleContinueToPayment}
              >
                {creatingDraft ? 'Creating…' : 'Continue to payment'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Validation Error (hidden when selected child has active package — we show that in the amber block below) */}
        {validationError && !selectedChildHasActivePackage && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              <p className="text-sm text-red-800 font-medium">{validationError}</p>
            </div>
          </div>
        )}

        {/* Draft creation error (e.g. missing phone, API failure) */}
        {draftError && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              <p className="text-sm text-red-800 font-medium">{draftError}</p>
            </div>
          </div>
        )}

        {/* Child Selector (if multiple children or no pre-selected child) */}
        {showChildDropdown && (
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              For which child?
            </label>
            <button
              type="button"
              onClick={() => setShowChildSelector(!showChildSelector)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                {selectedChild ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getChildColor(selectedChild.id) }}
                    />
                    <span className="text-sm text-gray-900 truncate">{selectedChild.name}</span>
                    {(() => {
                      const childHours = childrenWithHours.find(c => c.child.id === selectedChild.id);
                      if (childHours) {
                        const isCritical = childHours.remainingHours <= 0;
                        return (
                          <span className={`text-xs font-semibold truncate ${
                            isCritical ? 'text-red-600' : 'text-green-600'
                          }`}>
                            ({childHours.remainingHours.toFixed(1)}h)
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Select a child</span>
                )}
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 flex-shrink-0 transition-transform ${
                  showChildSelector ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Dropdown Menu - Inline Status Indicators */}
            {showChildSelector && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto">
                {/* Available Children (without active packages) */}
                {[...groupedChildren.needsHours, ...groupedChildren.sufficientHours]
                  .sort((a, b) => {
                    // Keep needs hours first, then sufficient hours
                    if (a.remainingHours <= 0 && b.remainingHours > 0) return -1;
                    if (a.remainingHours > 0 && b.remainingHours <= 0) return 1;
                    // Within same group, sort by hours (lowest first)
                    return a.remainingHours - b.remainingHours;
                  })
                  .map(({ child, remainingHours }) => {
                    const isCritical = remainingHours <= 0;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleChildSelect(child.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition ${
                          selectedChildId === child.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getChildColor(child.id) }}
                        />
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">{child.name}</span>
                          <span className={`text-xs font-semibold flex-shrink-0 ${
                            isCritical ? 'text-red-600' : 'text-green-600'
                          }`}>
                            ({remainingHours.toFixed(1)}h)
                          </span>
                          {isCritical && (
                            <span className="text-xs font-semibold text-red-600 flex-shrink-0">
                              NEEDS HOURS
                            </span>
                          )}
                        </div>
                        <CheckCircle2 className="ml-auto text-green-600 flex-shrink-0" size={16} />
                        {selectedChildId === child.id && (
                          <span className="ml-1 text-blue-600 text-xs font-semibold flex-shrink-0">✓</span>
                        )}
                      </button>
                    );
                  })}

                {/* Unavailable Children (with active packages) - Show at bottom, grayed out */}
                {unavailableChildren.length > 0 && (
                  <>
                    {groupedChildren.needsHours.length > 0 || groupedChildren.sufficientHours.length > 0 ? (
                      <div className="border-t border-gray-200 my-1"></div>
                    ) : null}
                    {unavailableChildren.map(({ child }) => {
                      const activePackageInfo = childrenWithActivePackages.get(child.id);
                      const packageName = activePackageInfo?.packageName || 'Package';
                      const expiresAt = activePackageInfo?.expiresAt 
                        ? new Date(activePackageInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'No expiry set';
                      
                      return (
                        <div
                          key={child.id}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left opacity-60 cursor-not-allowed"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getChildColor(child.id) }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600 truncate">{child.name}</span>
                              <XCircle className="text-amber-600 flex-shrink-0" size={14} />
                            </div>
                            <div className="text-xs text-amber-700 mt-0.5">
                              Active package: {packageName} (expires {expiresAt})
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Fallback: If no hours data, show simple list (only available children) */}
                {groupedChildren.needsHours.length === 0 && groupedChildren.sufficientHours.length === 0 && availableChildren.length === 0 && unavailableChildren.length === 0 && (
                  <>
                    {children.map((c) => {
                      const hasActivePackage = childrenWithActivePackages.has(c.id);
                      if (hasActivePackage) return null; // Skip children with active packages
                      
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleChildSelect(c.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition ${
                            selectedChildId === c.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getChildColor(c.id) }}
                          />
                          <span className="text-sm text-gray-900">{c.name}</span>
                          {selectedChildId === c.id && (
                            <span className="ml-auto text-blue-600 text-xs">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Child Display (if single child or child selected) */}
        {!showChildDropdown && selectedChild && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: getChildColor(selectedChild.id) }}
            />
            <span className="text-sm font-medium text-gray-900">{selectedChild.name}</span>
          </div>
        )}

        {/* Header Message */}
        {selectedChildHasActivePackage ? (
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900 mb-1">
                  This child already has an active package
                </h4>
                {(() => {
                  const activePackageInfo = childrenWithActivePackages.get(selectedChildId!);
                  const packageName = activePackageInfo?.packageName || 'Package';
                  const expiresAt = activePackageInfo?.expiresAt
                    ? new Date(activePackageInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : null;
                  return (
                    <>
                      <p className="text-sm text-amber-800 mb-2">
                        <span className="font-semibold text-amber-900">{childName}</span> has an active package ({packageName}
                        {expiresAt ? `, expires ${expiresAt}` : ''}). Each child can only have one active package at a time.
                      </p>
                      <p className="text-xs text-amber-700 mb-3">
                        You can add more hours (top-up) to this package or purchase a new package after the current one expires.
                      </p>
                      {onOpenTopUp && selectedChildId && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            onOpenTopUp(selectedChildId);
                            onClose();
                          }}
                          className="w-full sm:w-auto"
                        >
                          Add hours (top-up)
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : availableChildren.length === 0 && unavailableChildren.length > 0 ? (
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900 mb-1">
                  All Children Have Active Packages
                </h4>
                <p className="text-sm text-amber-800 mb-3">
                  All your children currently have active packages. Each child can only have one active package at a time.
                </p>
                <div className="space-y-2">
                  {unavailableChildren.map(({ child }) => {
                    const activePackageInfo = childrenWithActivePackages.get(child.id);
                    const packageName = activePackageInfo?.packageName || 'Package';
                    const expiresAt = activePackageInfo?.expiresAt 
                      ? new Date(activePackageInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'No expiry set';
                    
                    return (
                      <div key={child.id} className="text-xs text-amber-700">
                        <strong>{child.name}:</strong> {packageName} (expires {expiresAt})
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-amber-700 mt-3">
                  You can purchase another package once the current packages expire or are completed.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center">
            {isChildSelected ? (
              <>Select a package to purchase hours for <span className="font-semibold text-gray-900">{childName}</span></>
            ) : (
              <>Please select a child first, then choose a package</>
            )}
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-600">Loading packages...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-8 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={fetchPackages}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Packages Grid (hidden when selected child already has an active package) */}
        {!loading && !error && packages.length > 0 && availableChildren.length > 0 && !selectedChildHasActivePackage && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {creatingDraft && (
                <div className="col-span-full flex items-center justify-center gap-2 py-4 text-sm text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Creating booking…</span>
                </div>
              )}
              {packages.map((pkg) => (
                <div key={pkg.id} data-package-slug={pkg.slug}>
                  <MiniPackageCard
                    package={pkg}
                    childId={selectedChildId ?? undefined}
                    onSelect={(slug) => setSelectedPackageSlug(slug)}
                    disabled={creatingDraft || !isChildSelected}
                    isSelected={selectedPackageSlug === pkg.slug}
                  />
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Hide packages if all children have active packages (and we're not already showing the "this child has a package" message) */}
        {!loading && !error && packages.length > 0 && availableChildren.length === 0 && !selectedChildHasActivePackage && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              No children available for new packages. All children have active packages.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && packages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">No packages available</p>
            <p className="text-xs text-gray-500">Please check back later or contact support.</p>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
