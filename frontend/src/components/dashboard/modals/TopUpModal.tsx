"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Loader2, Info } from "lucide-react";
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import { BaseModal } from "@/components/ui/Modal";
import { TOP_UP_CALCULATION_TOOLTIP } from "@/shared/utils/appConstants";
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
  const [showCalcPopover, setShowCalcPopover] = useState(false);
  const calcPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCalcPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (calcPopoverRef.current?.contains(e.target as Node)) return;
      setShowCalcPopover(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalcPopover]);

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
          <Plus size={18} className="text-primary-blue" />
          Add hours (top-up)
        </span>
      }
      size="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <DashboardButton type="button" variant="bordered" size="sm" onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton
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
          </DashboardButton>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-2xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">{childName}</span>
          {" · "}
          <span>{packageName}</span>
        </p>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {PRESET_HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setSelectedHours(h);
                  setCustomHours("");
                }}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                  !customHours && selectedHours === h
                    ? "border-primary-blue bg-primary-blue/10 text-primary-blue"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {h}h
              </button>
            ))}
            <span className="text-2xs text-slate-500 dark:text-slate-400">Other</span>
            <input
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              placeholder="0"
              className="w-14 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Custom hours"
            />
            <span className="text-2xs text-slate-500 dark:text-slate-400">h</span>
          </div>
        </div>

        <div ref={calcPopoverRef} className="relative flex items-center justify-between rounded-lg border border-primary-blue/20 bg-gcal-primary-light px-3 py-2 dark:border-primary-blue/30 dark:bg-primary-blue/10">
          <span className="text-sm text-navy-blue dark:text-slate-200">
            {isValid ? (
              <>{displayHours}h × {formatCurrency(hourlyRate)}/h</>
            ) : (
              "—"
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-navy-blue dark:text-slate-50">
              {isValid ? formatCurrency(totalPrice) : "—"}
            </span>
            <button
              type="button"
              onClick={() => setShowCalcPopover((v) => !v)}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-1 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200"
              aria-label="How is top-up calculated?"
              aria-expanded={showCalcPopover}
            >
              <Info size={14} aria-hidden />
            </button>
          </div>
          {showCalcPopover && (
            <div
              className="absolute right-0 bottom-full z-dropdown mb-1.5 w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-2xs text-slate-600 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              role="tooltip"
            >
              {TOP_UP_CALCULATION_TOOLTIP}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
