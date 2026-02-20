"use client";

import React from "react";
import { Clock, Calendar, Activity, Sparkles } from "lucide-react";
import type { PackageDTO } from "@/core/application/packages/dto/PackageDTO";
import Button from "@/components/ui/Button";

interface MiniPackageCardProps {
  package: PackageDTO;
  childId?: number;
  onSelect: (packageSlug: string) => void;
  disabled?: boolean;
  /** When true, show selected state (blue border/background) for two-step flow. */
  isSelected?: boolean;
}

/**
 * Mini Package Card Component
 * 
 * Compact package card for use in modals (BuyHoursModal).
 * Shows essential package info in a small, clickable card.
 */
export default function MiniPackageCard({
  package: pkg,
  childId,
  onSelect,
  disabled = false,
  isSelected = false,
}: MiniPackageCardProps) {
  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all duration-200
        ${disabled 
          ? 'bg-gray-50 cursor-not-allowed opacity-60' 
          : isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-500/30 cursor-pointer'
            : 'bg-white hover:shadow-lg cursor-pointer border-gray-200 hover:border-blue-300'
        }
        ${pkg.popular && !isSelected ? 'border-[#FFD700] ring-2 ring-[#FFD700]/30' : ''}
      `}
      onClick={() => !disabled && onSelect(pkg.slug)}
      title={disabled ? 'Please select a child first' : undefined}
    >
      <div className="p-4">
        {/* Popular Badge */}
        {pkg.popular && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-navy-blue text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles size={8} />
              <span>Popular</span>
            </div>
          </div>
        )}

        {/* Package Name */}
        <h3 className="text-lg font-bold text-navy-blue mb-2 pr-12">
          {pkg.name}
        </h3>

        {/* Key Stats - Compact */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-blue-600" />
            <span className="font-semibold">{pkg.hours}h</span>
          </div>
          {pkg.totalWeeks && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar size={12} className="text-purple-600" />
                <span className="font-semibold">{pkg.totalWeeks}w</span>
              </div>
            </>
          )}
          {pkg.calculatedActivities && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Activity size={12} className="text-green-600" />
                <span className="font-semibold">{pkg.calculatedActivities}</span>
              </div>
            </>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-2xl font-extrabold text-navy-blue dark:text-gray-100">
            £{pkg.price}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
            {pkg.hours > 0 && (
              <span>£{(pkg.price / pkg.hours).toFixed(1)}/hour</span>
            )}
            {pkg.totalWeeks > 0 && (
              <span>Valid {pkg.totalWeeks} weeks</span>
            )}
            {!pkg.hours && !pkg.totalWeeks && <span>Complete Package</span>}
          </div>
        </div>

        {/* Select / Book button */}
        <Button
          type="button"
          variant={isSelected ? 'bordered' : 'primary'}
          size="sm"
          className="w-full text-xs font-semibold"
          disabled={disabled}
          onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
            e?.stopPropagation();
            if (!disabled) {
              onSelect(pkg.slug);
            }
          }}
          title={disabled ? 'Please select a child first' : undefined}
        >
          {isSelected ? 'Selected' : 'Select package'}
        </Button>
      </div>
    </div>
  );
}
