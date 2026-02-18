"use client";

import React, { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { BaseModal } from "@/components/ui/Modal";
import type { BookingDTO } from "@/core/application/booking/dto/BookingDTO";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const PRESET_HOURS = [5, 10, 15, 20];

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Child for display */
  childName: string;
  /** Active booking (confirmed + paid) for this child; used for package name and price per hour */
  booking: BookingDTO | null;
  /** Called when user confirms top-up: (hours, totalPrice). Parent can open payment or contact. */
  onProceedToPayment?: (hours: number, totalPrice: number) => void;
  /** If true, show loading on proceed button */
  isSubmitting?: boolean;
}

/**
 * Top-up modal: add hours to an existing package with price calculation.
 * Price = (package price / package hours) × top-up hours.
 */
export default function TopUpModal({
  isOpen,
  onClose,
  childName,
  booking,
  onProceedToPayment,
  isSubmitting = false,
}: TopUpModalProps) {
  const [selectedHours, setSelectedHours] = useState<number>(5);
  const [customHours, setCustomHours] = useState<string>("");

  const { packageName, hourlyRate, totalPrice, isValid } = useMemo(() => {
    if (!booking?.package) {
      return { packageName: "—", hourlyRate: 0, totalPrice: 0, isValid: false };
    }
    const pkg = booking.package;
    const totalPackageHours = pkg.hours ?? booking.totalHours ?? 0;
    const packagePrice = pkg.price ?? booking.totalPrice ?? 0;
    const rate = totalPackageHours > 0 ? packagePrice / totalPackageHours : 0;
    const hours = customHours.trim() ? parseFloat(customHours) : selectedHours;
    const valid = hours >= 1 && hours <= 100 && Number.isFinite(hours);
    return {
      packageName: pkg.name ?? "Package",
      hourlyRate: rate,
      totalPrice: valid ? Math.round(hours * rate * 100) / 100 : 0,
      isValid: valid,
    };
  }, [booking, selectedHours, customHours]);

  const handleProceed = () => {
    const hours = customHours.trim() ? parseFloat(customHours) : selectedHours;
    if (!isValid || hours < 1 || totalPrice <= 0) return;
    onProceedToPayment?.(hours, totalPrice);
  };

  const displayHours = customHours.trim() ? parseFloat(customHours) : selectedHours;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Plus size={18} className="text-green-600" />
          Add hours (top-up)
        </span>
      }
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button type="button" variant="bordered" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleProceed}
            disabled={!isValid || !onProceedToPayment || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Processing…
              </>
            ) : (
              <>Proceed to payment · {formatCurrency(totalPrice)}</>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{childName}</span>
            {" · "}
            <span className="text-gray-600">{packageName}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Add more hours to this package at the same rate. Your existing expiry date stays the same.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How many hours do you want to add?
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setSelectedHours(h);
                  setCustomHours("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  !customHours && selectedHours === h
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Other:</span>
            <input
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              placeholder="e.g. 7"
              className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-500">hours</span>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">
              {isValid ? (
                <>
                  {displayHours} {displayHours === 1 ? "hour" : "hours"} × {formatCurrency(hourlyRate)}/h
                </>
              ) : (
                "Select or enter hours"
              )}
            </span>
            <span className="text-lg font-bold text-green-900">
              {isValid ? formatCurrency(totalPrice) : "—"}
            </span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
