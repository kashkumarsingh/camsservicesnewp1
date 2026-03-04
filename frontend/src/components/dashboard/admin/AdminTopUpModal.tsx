'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Loader2, Copy, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { CURRENCY_CODE } from '@/utils/appConstants';
import type { AdminBookingDTO } from '@/core/application/admin/dto/AdminBookingDTO';
import type { BookingTopUpApiResponse } from '@/core/application/booking/dto/BookingTopUpApiResponse';

const PRESET_HOURS = [5, 10, 15, 20];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface AdminTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminBookingDTO | null;
  onCreateTopUp: (bookingId: string, hours: number, currency: string) => Promise<BookingTopUpApiResponse>;
  isSubmitting?: boolean;
}

/**
 * Admin top-up modal: create a payment link for adding hours to a booking.
 * Parent completes payment via the returned checkout URL.
 */
export function AdminTopUpModal({
  isOpen,
  onClose,
  booking,
  onCreateTopUp,
  isSubmitting = false,
}: AdminTopUpModalProps) {
  const [selectedHours, setSelectedHours] = useState<number>(5);
  const [customHours, setCustomHours] = useState<string>('');
  const [result, setResult] = useState<BookingTopUpApiResponse | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const { packageName, hourlyRate, totalPrice, isValid } = useMemo(() => {
    if (!booking) {
      return { packageName: '—', hourlyRate: 0, totalPrice: 0, isValid: false };
    }
    const totalPackageHours = booking.totalHours ?? 0;
    const packagePrice = booking.totalPrice ?? 0;
    const rate = totalPackageHours > 0 ? packagePrice / totalPackageHours : 0;
    const hours = customHours.trim() ? parseFloat(customHours) : selectedHours;
    const valid = hours >= 1 && hours <= 100 && Number.isFinite(hours);
    return {
      packageName: booking.packageName ?? 'Package',
      hourlyRate: rate,
      totalPrice: valid ? Math.round(hours * rate * 100) / 100 : 0,
      isValid: valid,
    };
  }, [booking, selectedHours, customHours]);

  const handleCreateLink = async () => {
    const hours = customHours.trim() ? parseFloat(customHours) : selectedHours;
    if (!booking || !isValid || hours < 1 || totalPrice <= 0) return;
    try {
      const data = await onCreateTopUp(booking.id, hours, CURRENCY_CODE);
      setResult(data);
    } catch {
      // Error surfaced by parent (toast)
    }
  };

  const handleClose = () => {
    setResult(null);
    setCustomHours('');
    setSelectedHours(5);
    setCopyFeedback(false);
    onClose();
  };

  const handleCopyUrl = async () => {
    const url = result?.checkoutUrl ?? '';
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // Fallback not needed in modern browsers
    }
  };

  const displayHours = customHours.trim() ? parseFloat(customHours) : selectedHours;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Plus size={18} className="text-primary-blue" />
          Add hours (top-up)
        </span>
      }
      size="md"
      footer={
        <div className="flex w-full justify-end gap-2">
          {result ? (
            <Button type="button" variant="primary" size="sm" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button type="button" variant="bordered" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCreateLink}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Creating link…
                  </>
                ) : (
                  <>Create payment link · {formatCurrency(totalPrice)}</>
                )}
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {result ? (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
              Share this link with the parent to complete payment
            </p>
            <p className="text-2xs text-slate-600 dark:text-slate-400">
              {result.hours != null && result.amount != null && (
                <>Top-up: {result.hours}h · {formatCurrency(result.amount)}</>
              )}
            </p>
            {result.checkoutUrl && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={result.checkoutUrl}
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-2xs text-slate-700 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    aria-label="Checkout URL"
                  />
                  <Button
                    type="button"
                    variant="bordered"
                    size="sm"
                    onClick={handleCopyUrl}
                    icon={copyFeedback ? undefined : <Copy className="h-3.5 w-3.5" />}
                    aria-label="Copy link"
                  >
                    {copyFeedback ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    type="button"
                    variant="bordered"
                    size="sm"
                    onClick={() => window.open(result!.checkoutUrl ?? '', '_blank', 'noopener,noreferrer')}
                    icon={<ExternalLink className="h-3.5 w-3.5" />}
                    aria-label="Open link in new tab"
                  >
                    Open
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                <span className="font-semibold text-slate-900 dark:text-slate-50">{booking?.parentName ?? '—'}</span>
                {' · '}
                <span className="text-slate-600 dark:text-slate-300">{packageName}</span>
              </p>
              <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">
                A payment link will be created. Share it with the parent to add hours at the same package rate.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Hours to add
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {PRESET_HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setSelectedHours(h);
                      setCustomHours('');
                    }}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      !customHours && selectedHours === h
                        ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Other:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  placeholder="e.g. 7"
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">hours</span>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  {isValid ? (
                    <>
                      {displayHours} {displayHours === 1 ? 'hour' : 'hours'} × {formatCurrency(hourlyRate)}/h
                    </>
                  ) : (
                    'Select or enter hours'
                  )}
                </span>
                <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {isValid ? formatCurrency(totalPrice) : '—'}
                </span>
              </div>
              {isValid && totalPrice > 0 && (
                <p className="text-2xs text-emerald-700 dark:text-emerald-300">
                  Parent will pay {formatCurrency(totalPrice)} via the generated link. Hours apply after payment.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}
