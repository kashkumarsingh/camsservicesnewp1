'use client';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useSearchParams } from 'next/navigation';

import React from 'react';
import Button from '@/components/ui/Button/Button';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Shield, 
  Star, 
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Heart,
  } from 'lucide-react';
import type { IconComponent } from '@/types/icons';
import Image from 'next/image';

// Icon mapping for string-based icon names
const iconMap: Record<string, IconComponent> = {
  Clock,
  Calendar,
  Shield,
  Star,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Heart,
  CheckCircle2,
};

export interface QuickStat {
  icon: string; // Icon name as string (e.g., 'Clock', 'Calendar')
  value: string | number;
  label: string;
  variant?: 'gold' | 'glass';
}

export interface PricingInfo {
  price: number;
  originalPrice?: number;
  priceLabel?: string;
  highlightValue?: string | number;
  highlightLabel?: string;
}

export interface ProductHeroProps {
  // Badge
  badge?: {
    text: string;
    icon?: string; // Icon name as string
    variant?: 'gold' | 'blue' | 'gradient';
  };

  // Main Content
  title: string;
  subtitle?: string;
  description: string;

  // Quick Stats (left column)
  quickStats?: QuickStat[];

  // CTAs (left column)
  primaryCTA: {
    text: string;
    href: string;
    icon?: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };

  // Pricing Card (right column)
  pricing: PricingInfo;
  features: string[];
  
  // Trust Indicators
  trustBadges?: Array<{
    icon: string; // Icon name as string
    text: string;
  }>;

  // Background
  backgroundType?: 'video' | 'image' | 'gradient';
  backgroundSrc?: string;
  gradientFrom?: string;
  gradientTo?: string;

  // Optional spots remaining
  spotsRemaining?: number;
}

const ProductHero: React.FC<ProductHeroProps> = ({
  badge,
  title,
  subtitle,
  description,
  quickStats = [],
  primaryCTA,
  secondaryCTA,
  pricing,
  features,
  trustBadges,
  backgroundType = 'gradient',
  backgroundSrc,
  gradientFrom = '#0080FF',
  gradientTo = '#1E3A5F',
  spotsRemaining,
}) => {
  const savings = pricing.originalPrice ? pricing.originalPrice - pricing.price : 0;
  const { isApproved, loading } = useAuth();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');
  
  // Preserve childId in booking URLs
  const primaryBookingUrl = primaryCTA.href.startsWith('/book/') && childId
    ? `${primaryCTA.href}?childId=${childId}`
    : primaryCTA.href;

  // Get icon components from string names
  const BadgeIcon = badge?.icon ? iconMap[badge.icon] : null;

  return (
    <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-[85vh] flex items-center">
      {/* Background Layer */}
      {backgroundType === 'video' && backgroundSrc && (
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={backgroundSrc}
          loop
          autoPlay
          muted
          playsInline
        />
      )}
      {backgroundType === 'image' && backgroundSrc && (
        <Image
          src={backgroundSrc}
          alt="Background"
          fill
          className="object-cover z-0"
          priority
          sizes="100vw"
        />
      )}
      {backgroundType === 'gradient' && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
          }}
        ></div>
      )}

      {/* Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(to bottom right, ${gradientFrom}80, ${gradientTo}B3)`,
        }}
      ></div>
      
      {/* Pattern Overlay (optional) */}
      <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/orbit-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
      
      <div className="relative z-20 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Product Info */}
          <div>
            {/* Badge */}
            {badge && (
              <div className={`
                inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 font-bold text-sm
                ${badge.variant === 'gold' ? 'bg-[#FFD700] text-[#1E3A5F]' : ''}
                ${badge.variant === 'blue' ? 'bg-[#0080FF] text-white' : ''}
                ${badge.variant === 'gradient' ? 'bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white' : ''}
              `}>
                {BadgeIcon && <BadgeIcon size={18} />}
                {badge.text}
              </div>
            )}

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-6 leading-tight heading-text-shadow">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-2xl md:text-3xl font-bold mb-4 text-[#FFD700]">
                {subtitle}
              </p>
            )}

            {/* Description */}
            <p className="text-xl md:text-2xl mb-8 font-light leading-relaxed">
              {description}
            </p>

            {/* Quick Stats */}
            {quickStats.length > 0 && (
              <div className={`grid ${quickStats.length === 2 ? 'grid-cols-2' : quickStats.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} gap-4 mb-8`}>
                {quickStats.map((stat, index) => {
                  const Icon = iconMap[stat.icon];
                  if (!Icon) return null;
                  return (
                    <div 
                      key={index}
                      className={`
                        backdrop-blur-md rounded-2xl p-5 border shadow-lg
                        ${stat.variant === 'gold' 
                          ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-2 border-white/30' 
                          : 'bg-white/10 border border-white/20'
                        }
                      `}
                    >
                      <Icon className={stat.variant === 'gold' ? 'text-[#1E3A5F] mb-2' : 'text-[#00D4FF] mb-2'} size={28} />
                      <div className={`text-4xl font-extrabold ${stat.variant === 'gold' ? 'text-[#1E3A5F]' : 'text-white'}`}>
                        {stat.value}
                      </div>
                      <div className={`text-sm ${stat.variant === 'gold' ? 'font-bold text-[#1E3A5F] uppercase tracking-wide' : 'opacity-90'}`}>
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href={primaryCTA.href} variant="yellow" size="lg" className="shadow-2xl" withArrow>
                {primaryCTA.icon && <span className="mr-2">{primaryCTA.icon}</span>}
                {primaryCTA.text}
              </Button>
              {secondaryCTA && (
                <Button href={secondaryCTA.href} variant="outlineWhite" size="lg" className="shadow-lg">
                  {secondaryCTA.text}
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Pricing Card */}
          <div className="lg:flex lg:justify-end">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full border-4 border-[#00D4FF] relative">
              {/* Spots Remaining (if provided) - Subtle & Elegant */}
              {spotsRemaining && spotsRemaining <= 10 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border-2 border-orange-200 text-sm font-semibold flex items-center gap-2 hover:border-orange-400 transition-all duration-300">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700">{spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} remaining</span>
                  </div>
                </div>
              )}

              {/* Savings Badge */}
              {savings > 0 && (
                <div className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white text-center py-2 px-4 rounded-full mb-6 font-bold text-sm shadow-lg">
                  🔥 SAVE £{savings} - Limited Time Offer!
                </div>
              )}

              {/* Highlight Value (e.g., Total Hours) */}
              {pricing.highlightValue && (
                <div className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] rounded-2xl p-6 mb-6 text-white text-center shadow-lg">
                  <div className="text-5xl font-extrabold mb-1">{pricing.highlightValue}</div>
                  <div className="text-sm font-bold uppercase tracking-wide">{pricing.highlightLabel || 'Total Hours'}</div>
                </div>
              )}
              {/* Price - Only show for approved parents */}
              {!loading && isApproved && (
                <div className="text-center mb-6">
                  {pricing.originalPrice && (
                    <div className="text-gray-400 line-through text-xl mb-2">£{pricing.originalPrice}</div>
                  )}
                  <div className="text-5xl font-extrabold text-[#1E3A5F] mb-2">£{pricing.price}</div>
                  <div className="text-gray-600 font-medium text-sm">{pricing.priceLabel || 'Complete Package'}</div>
                </div>
              )}

              {/* Features Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-[#0080FF]" size={20} />
                  What&apos;s Included:
                </h3>
                <ul className="space-y-3">
                  {features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="text-[#0080FF] flex-shrink-0 mt-0.5" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {features.length > 4 && (
                    <li className="text-sm text-[#0080FF] font-semibold">
                      + {features.length - 4} more benefits
                    </li>
                  )}
                </ul>
              </div>

              {/* Book Button */}
              <Button href={primaryBookingUrl} variant="primary" size="lg" className="w-full mb-4" withArrow>
                Secure Your Spot Now
              </Button>

              {/* Trust Indicators */}
              {trustBadges && trustBadges.length > 0 && (
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600 flex-wrap">
                  {trustBadges.map((badge, index) => {
                    const Icon = iconMap[badge.icon];
                    if (!Icon) return null;
                    return (
                      <div key={index} className="flex items-center gap-1">
                        <Icon size={14} className="text-[#0080FF]" />
                        <span>{badge.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHero;

