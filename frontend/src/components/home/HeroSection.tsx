'use client';

import Link from 'next/link';
import { Sparkles, CheckCircle2, Star, Award, Shield, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/utils/routes';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { DEFAULT_HOME_STRINGS } from '@/components/home/constants';
import type { CTAConfig } from '@/core/domain/pages/valueObjects/homePageSections';
import type { ReviewProviderSummary } from '@/interfaces/web/hooks/reviews/useReviewAggregate';

export interface HeroSectionConfig {
  badgeText?: string;
  heading: string;
  subheading?: string;
  primaryCta?: CTAConfig;
  secondaryCta?: CTAConfig;
  backgroundVideoUrl?: string;
}

export interface HeroSectionProps {
  config: HeroSectionConfig;
  impactStats: Array<{ label: string; value: string; icon?: string }>;
  providerSummaries: ReviewProviderSummary[];
  isReviewAggregateLoading: boolean;
  isSiteSettingsLoading: boolean;
}

/** Hero — no z-index stacking; single background layer so fixed header stays on top. */
export function HeroSection({
  config,
  impactStats,
  providerSummaries,
  isReviewAggregateLoading,
  isSiteSettingsLoading,
}: HeroSectionProps) {
  const heroVideo = config.backgroundVideoUrl ?? '';
  const primaryCta = config.primaryCta;
  const secondaryCta = config.secondaryCta;

  return (
    <section
      className="relative min-h-[32rem] overflow-hidden bg-gradient-to-br from-primary-blue to-navy-blue text-white"
      aria-label="Hero"
    >
      {/* Single background layer — no z-index */}
      <div className="absolute inset-0">
        {heroVideo ? (
          <>
            <video
              className="h-full w-full object-cover"
              src={heroVideo}
              loop
              autoPlay
              muted
              playsInline
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary-blue/75 to-navy-blue/80"
              aria-hidden
            />
          </>
        ) : null}
      </div>

      {/* Content in normal flow — no z-index */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="space-y-6">
            {config.badgeText && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="text-star-gold shrink-0" size={16} aria-hidden />
                <span className="text-sm font-semibold">{config.badgeText}</span>
              </div>
            )}
            <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl lg:text-5xl">
              {config.heading}
            </h1>
            {config.subheading && (
              <p className="text-lg text-white/95 max-w-xl sm:text-xl">{config.subheading}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-primary-blue transition hover:bg-white/95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-blue"
                >
                  <span>{primaryCta.label}</span>
                  <ArrowRight size={18} aria-hidden />
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-transparent px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-blue"
                >
                  <span>{secondaryCta.label}</span>
                  <ArrowRight size={18} aria-hidden />
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
                <Shield className="text-orbital-green" size={14} />
                <span className="text-xs sm:text-sm font-semibold">{DEFAULT_HOME_STRINGS.HERO_BADGE_DBS}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
                <Star className="text-star-gold" size={14} />
                <span className="text-xs sm:text-sm font-semibold">{DEFAULT_HOME_STRINGS.HERO_BADGE_SATISFACTION}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
                <Award className="text-light-blue-cyan" size={14} />
                <span className="text-xs sm:text-sm font-semibold">{DEFAULT_HOME_STRINGS.HERO_BADGE_AWARD}</span>
              </div>
              {providerSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20"
                >
                  <Star className="text-star-gold" size={14} />
                  <span className="text-xs sm:text-sm font-semibold">
                    {summary.averageRating ? summary.averageRating.toFixed(1) : '4.9'}★ {summary.displayName}
                    {summary.reviewCount ? ` (${summary.reviewCount}+ reviews)` : ''}
                  </span>
                </div>
              ))}
              {isReviewAggregateLoading && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20 animate-pulse">
                  <Star className="text-white opacity-90" size={14} />
                  <span className="text-xs sm:text-sm font-semibold text-white/90">
                    {DEFAULT_HOME_STRINGS.LOADING_REVIEWS}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4 border border-white/30">
                  <Sparkles className="text-star-gold" size={16} />
                  <span className="text-sm font-bold text-white">{DEFAULT_HOME_STRINGS.QUICK_START}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{DEFAULT_HOME_STRINGS.READY_TO_GET_STARTED}</h3>
                <p className="text-sm text-white/90 mb-6">{DEFAULT_HOME_STRINGS.QUICK_START_DESCRIPTION}</p>
                <Link
                  href={ROUTES.PACKAGES}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orbital-green to-star-gold px-5 py-3 text-base font-bold text-navy-blue transition hover:opacity-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-blue"
                >
                  <span>{DEFAULT_HOME_STRINGS.VIEW_ALL_PACKAGES}</span>
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </div>
              <div className="space-y-3 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3 text-white/90 transition-transform duration-200 hover:translate-x-0.5">
                  <Shield className="text-orbital-green flex-shrink-0 drop-shadow-sm" size={18} />
                  <span className="text-sm font-semibold">{DEFAULT_HOME_STRINGS.TRUST_DBS_STAFF}</span>
                </div>
                <div className="flex items-center gap-3 text-white/90 transition-transform duration-200 hover:translate-x-0.5">
                  <CheckCircle2 className="text-star-gold flex-shrink-0 drop-shadow-sm" size={18} />
                  <span className="text-sm font-semibold">{DEFAULT_HOME_STRINGS.TRUST_SATISFACTION_RATE}</span>
                </div>
                <div className="flex items-center gap-3 text-white/90 transition-transform duration-200 hover:translate-x-0.5">
                  <Award className="text-light-blue-cyan flex-shrink-0 drop-shadow-sm" size={18} />
                  <span className="text-sm font-semibold">{DEFAULT_HOME_STRINGS.TRUST_AWARD_WINNING}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden mt-8 flex flex-wrap gap-2 sm:gap-4 justify-center">
            {isSiteSettingsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20 animate-pulse"
                  >
                    <div className="h-4 w-20 bg-white/20 rounded" />
                  </div>
                ))
              : impactStats.slice(0, 4).map((stat, index) => {
                  const iconKey = stat.icon?.toLowerCase() ?? 'star';
                  const Icon = ICON_COMPONENT_MAP[iconKey] ?? Star;
                  const colors = ['text-light-blue-cyan', 'text-star-gold', 'text-orbital-green', 'text-pink-500'];
                  const color = colors[index % colors.length];
                  return (
                    <div
                      key={`${stat.label}-${index}`}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20"
                    >
                      <Icon className={color} size={14} />
                      <span className="text-xs sm:text-sm font-semibold">
                        {stat.value} {stat.label}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
}
