'use client';

/**
 * useSmartValidation Hook
 * 
 * Clean Architecture Layer: Interface (Web Hooks)
 * Purpose: Provides real-time validation for bookings
 */

import { useMemo } from 'react';
import { useMyBookings } from './useMyBookings';
import { useChildBookedDates } from './useChildBookedDates';
import { SmartValidationService, ValidationResult } from '@/core/application/booking/services/SmartValidationService';
import { CreateBookingDTO } from '@/core/application/booking/dto/CreateBookingDTO';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';

interface UseSmartValidationOptions {
  dto: CreateBookingDTO | null;
  packageData: PackageDTO | null;
  childId: number | null;
}

export function useSmartValidation({
  dto,
  packageData,
  childId,
}: UseSmartValidationOptions) {
  const { bookings } = useMyBookings();
  const { bookedDates } = useChildBookedDates(childId);

  // Get previous bookings for this child
  const previousBookings = useMemo(() => {
    if (!bookings || !childId) return [];
    
    return bookings.filter(booking => {
      // Check if booking has this child as a participant
      return booking.participants?.some(p => {
        const participantChildId = typeof p.childId === 'string'
          ? parseInt(p.childId, 10)
          : p.childId;
        return participantChildId === childId;
      });
    });
  }, [bookings, childId]);

  // Validate booking
  const validationResult = useMemo<ValidationResult | null>(() => {
    if (!dto || !packageData) {
      return null;
    }

    return SmartValidationService.validateBooking(
      dto,
      packageData,
      previousBookings,
      bookedDates || []
    );
  }, [dto, packageData, previousBookings, bookedDates]);

  // Check duplicate booking
  const duplicateCheck = useMemo(() => {
    if (!dto || !packageData) {
      return { isDuplicate: false, conflictingBookings: [] };
    }

    return SmartValidationService.checkDuplicateBooking(
      dto,
      packageData,
      previousBookings
    );
  }, [dto, packageData, previousBookings]);

  // Check availability
  const availabilityCheck = useMemo(() => {
    if (!dto || !dto.schedules || dto.schedules.length === 0) {
      return { isAvailable: true, conflicts: [] };
    }

    return SmartValidationService.checkAvailability(
      dto.schedules,
      bookedDates || []
    );
  }, [dto, bookedDates]);

  // Check mode compatibility
  const modeCheck = useMemo(() => {
    if (!dto || !packageData) {
      return { isCompatible: true };
    }

    return SmartValidationService.checkModeCompatibility(
      dto.modeKey,
      packageData
    );
  }, [dto, packageData]);

  return {
    validationResult,
    duplicateCheck,
    availabilityCheck,
    modeCheck,
    isValid: validationResult?.valid ?? true,
    errors: validationResult?.errors ?? [],
    warnings: validationResult?.warnings ?? [],
  };
}
