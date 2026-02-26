/**
 * Package Card Component
 * 
 * Reusable card component for displaying package summary.
 */

'use client';

import React from 'react';
import { CheckCircle2, Sparkles, Shield, Clock, Users, Star, Info, Calendar, Activity } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PackageDTO, PackageRecommendation } from '@/core/application/packages';
import { renderHtml } from '@/utils/htmlRenderer';

interface PackageCardProps {
  package: PackageDTO;
  allPackages?: PackageDTO[]; // All packages for recommendation context (optional, for future use)
  recommendation?: PackageRecommendation | null; // Pre-calculated recommendation (passed from parent)
  isRecommended?: boolean; // Pre-calculated recommendation status (passed from parent)
}

export default function PackageCard({ 
  package: pkg, 
  allPackages = [pkg],
  recommendation = null,
  isRecommended = false,
}: PackageCardProps) {
  const { isApproved, loading, children } = useAuth();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  // Parents buy packages from dashboard only; public CTAs redirect to parent dashboard.
  const buyPackageUrl = childId
    ? `/dashboard/parent?package=${encodeURIComponent(pkg.slug)}&childId=${childId}`
    : `/dashboard/parent?package=${encodeURIComponent(pkg.slug)}`;
  const trainerAvatars = pkg.trainers?.slice(0, 3) ?? [];
  
  // Get child info for display
  const child = childId && children ? children.find(c => c.id === parseInt(childId, 10)) : null;
  const cardContent = (
    <div className={`
      relative rounded-card border-2 border-primary-blue/20 shadow-card
      card-hover-lift transition-all duration-300
      flex flex-col justify-between p-6 md:p-8 bg-white h-full overflow-hidden md:hover:rotate-3 group
      ${pkg.popular ? 'ring-2 ring-primary-blue/30' : ''}
    `}>
      {/* Recommended Badge - Subtle top-left */}
      {isRecommended && recommendation && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-navy-blue text-white text-[10px] font-semibold px-2 py-1 rounded-form-alert flex items-center gap-1">
            <Star size={10} className="fill-current" />
            <span>Recommended</span>
          </div>
        </div>
      )}

      {/* Popular Badge - Show if not recommended */}
      {pkg.popular && !isRecommended && (
        <div className="absolute top-3 right-3 z-10">
          <div className="border border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-medium px-2 py-1 rounded-form-alert flex items-center gap-1">
            <Sparkles size={10} className="text-star-gold" />
            <span>Popular</span>
          </div>
        </div>
      )}

      {/* Spots Remaining Badge */}
      {pkg.spotsRemaining && pkg.spotsRemaining <= 5 && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-form-alert">
            {pkg.spotsRemaining} left
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="flex-1">
        {/* Small icon in neutral container */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-5 mx-auto">
          <div className="absolute inset-0 bg-primary-blue/10 rounded-form-input flex items-center justify-center">
            <Image 
              src={`/svgs/planet-${(parseInt(pkg.id) % 5) + 1}.svg`} 
              alt={`${pkg.name} Package Icon`} 
              fill 
              className="object-contain p-2"
              sizes="56px"
            />
          </div>
        </div>

        {/* Package Name */}
        <div className="mb-3 text-center">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-navy-blue">
            {pkg.name}
          </h3>
          {/* Recommendation Note - Very subtle */}
          {isRecommended && recommendation && child && (
            <div className="mt-1 text-[10px] text-navy-blue/80 font-medium">
              Great match for {child.name}
            </div>
          )}
        </div>

        {/* Key Info - Simplified */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm text-navy-blue/80">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-primary-blue flex-shrink-0" />
            <span className="font-semibold text-navy-blue">{pkg.hours}h</span>
          </div>
          {pkg.totalWeeks && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-star-gold flex-shrink-0" />
                <span className="font-semibold text-navy-blue">{pkg.totalWeeks} {pkg.totalWeeks === 1 ? 'week' : 'weeks'}</span>
              </div>
            </>
          )}
          {pkg.calculatedActivities && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Activity size={16} className="text-orbital-green flex-shrink-0" />
                <span className="font-semibold text-navy-blue">{pkg.calculatedActivities} activities</span>
              </div>
            </>
          )}
        </div>

        {/* Price */}
        {!loading && isApproved && (
          <div className="text-center mb-6">
            <div className="text-2xl sm:text-3xl font-bold text-navy-blue mb-1">
              £{pkg.price}
            </div>
            <span className="text-xs sm:text-sm text-navy-blue/80 font-medium">
              Complete Package
            </span>
          </div>
        )}

        {/* Description */}
        <div className="text-navy-blue/80 text-sm mb-5 text-center line-clamp-2">
          {renderHtml(pkg.description)}
        </div>

        {/* Features - Compact */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="mb-5">
            <ul className="space-y-1.5">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-navy-blue/80">
                  <CheckCircle2 className="text-primary-blue flex-shrink-0" size={14} />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {pkg.features.length > 3 && (
                <li className="text-xs text-navy-blue/80 font-medium pl-5">
                  +{pkg.features.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="mt-auto pt-4 space-y-2">
        {pkg.popular ? (
          <>
            <Link 
              href={buyPackageUrl}
              className="block w-full py-3 px-6 rounded-form-button bg-navy-blue text-white font-semibold text-center text-sm hover:bg-navy-blue/90 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Buy package</span>
            </Link>
            <Link 
              href={`/packages/${pkg.slug}`}
              className="block w-full py-2.5 px-6 rounded-form-button border-2 border-primary-blue/30 text-navy-blue font-medium text-center text-sm hover:bg-primary-blue/10 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>View details</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </>
        ) : (
          <div 
            className="w-full py-3 px-6 rounded-form-button border-2 border-primary-blue/20 text-navy-blue font-semibold text-center text-sm flex items-center justify-center gap-2 pointer-events-none"
          >
            <span>View details</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  // For popular packages, we have action buttons inside, so don't wrap in Link
  // For non-popular packages, the entire card is clickable
  if (pkg.popular) {
    return <div className="group block h-full">{cardContent}</div>;
  }

  return (
    <Link href={`/packages/${pkg.slug}`} className="group block h-full">
      {cardContent}
    </Link>
  );
}


