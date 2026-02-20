'use client';

/**
 * Hero Package Selection Component
 * 
 * Clean Architecture Layer: Presentation (UI Components)
 * Purpose: Visual package selection in hero section - CRO optimized
 * 
 * Features:
 * - Visual package cards with pricing
 * - "Most Popular" badge
 * - Clear CTAs ("Get Started" / "Book Now")
 * - Responsive grid layout
 * - Accessibility compliant (WCAG 2.1 AA)
 * 
 * @component
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { Clock, CheckCircle2, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatHours } from '@/utils/formatHours';
import { ROUTES } from '@/utils/routes';

interface HeroPackageSelectionProps {
  packages: PackageDTO[];
  maxDisplay?: number; // Maximum packages to show (default: 3)
}

/**
 * Hero Package Selection Component
 * 
 * Displays visual package cards in hero section for CRO-optimized booking flow.
 * Follows best practices from Airbnb, ClassPass, and Urban.
 */
const HeroPackageSelection: React.FC<HeroPackageSelectionProps> = ({
  packages,
  maxDisplay = 3,
}) => {
  const router = useRouter();

  // Sort packages: most popular first, then by price
  const sortedPackages = React.useMemo(() => {
    return [...packages]
      .sort((a, b) => {
        // Prioritize packages marked as popular
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        // Then sort by price (ascending)
        return Number(a.price) - Number(b.price);
      })
      .slice(0, maxDisplay);
  }, [packages, maxDisplay]);

  const handlePackageSelect = (packageSlug: string) => {
    // Navigate to booking flow with selected package
    router.push(`/book/${packageSlug}`);
  };

  if (sortedPackages.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header - Compact for Hero */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full mb-3 border border-white/30">
          <Sparkles className="text-[#FFD700]" size={14} />
          <span className="text-xs font-bold text-white">Choose Package</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          Flexible Packages
        </h2>
        <p className="text-xs sm:text-sm text-white/90">
          Select your plan
        </p>
      </div>

      {/* Package Cards - Single Column for Hero */}
      <div className="space-y-3">
        {sortedPackages.map((pkg, index) => {
          const isPopular = pkg.popular || index === 0; // First package is popular by default
          const price = Number(pkg.price);
          const hours = Number(pkg.hours);

          return (
            <div
              key={pkg.id}
              className={`
                relative group cursor-pointer
                rounded-xl border-2 transition-all duration-300
                ${isPopular 
                  ? 'border-[#FFD700] bg-gradient-to-br from-white/25 to-white/10 shadow-xl' 
                  : 'border-white/30 bg-white/15 hover:border-white/50 hover:bg-white/20'
                }
                backdrop-blur-xl p-4
                hover:shadow-xl hover:scale-[1.01]
              `}
              onClick={() => handlePackageSelect(pkg.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePackageSelect(pkg.slug);
                }
              }}
              aria-label={`Select ${pkg.name} package`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-navy-blue px-3 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                    <TrendingUp size={10} />
                    <span>POPULAR</span>
                  </div>
                </div>
              )}

              {/* Package Content - Compact */}
              <div className="space-y-3">
                {/* Package Name */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">
                    {pkg.name}
                  </h3>
                </div>

                {/* Pricing - Compact */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-white">
                        {formatCurrency(price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/80 mt-0.5">
                      <Clock size={12} />
                      <span>{formatHours(hours)} hours</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button - Compact */}
                <button
                  className={`
                    w-full mt-2 py-2 px-3 rounded-lg font-bold text-xs
                    transition-all duration-300 flex items-center justify-center gap-1.5
                    ${isPopular
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-navy-blue hover:from-[#FFA500] hover:to-[#FF8C00] shadow-md'
                      : 'bg-white/20 text-white border border-white/30 hover:bg-white/30 hover:border-white/50'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePackageSelect(pkg.slug);
                  }}
                  aria-label={`Get started with ${pkg.name} package`}
                >
                  <span>Get Started</span>
                  <ArrowRight 
                    size={14} 
                    className="group-hover:translate-x-0.5 transition-transform" 
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link - Compact */}
      {packages.length > maxDisplay && (
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push(ROUTES.PACKAGES)}
            className="text-white/80 hover:text-white text-xs font-semibold underline underline-offset-2 transition-colors"
            aria-label="View all packages"
          >
            View All ({packages.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroPackageSelection;

