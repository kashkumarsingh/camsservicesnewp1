'use client';

import React from 'react';
import type { TrainerBooking } from '@/core/application/trainer/types';
import { BaseModal } from '@/components/ui/Modal';
import BookingDetail from '@/components/trainer/bookings/BookingDetail';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: TrainerBooking | null;
  onUpdate?: () => void;
}

export default function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  onUpdate,
}: BookingDetailModalProps) {
  if (!booking) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Booking: ${booking.reference}`}
      size="xl"
      footer={
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <BookingDetail booking={booking} />
      </div>
    </BaseModal>
  );
}
