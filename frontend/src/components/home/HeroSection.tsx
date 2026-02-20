'use client';

import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { Sparkles, CheckCircle2, Star, Award, Shield } from 'lucide-react';
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
    <Section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-primary-blue to-navy-blue">
      <video className="absolute inset-0 w-full h-full object-cover z-0" src={heroVideo} loop autoPlay muted playsInline />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/50 to-navy-blue/70 z-10" />
      <div
        className="absolute inset-0 z-10 opacity-10"
        style={{ backgroundImage: "url('/svgs/star.svg')", backgroundRepeat: 'repeat', backgroundSize: '40px 40px' }}
      />

      <div className="relative z-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            {config.badgeText && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 rounded-full mb-5 border border-white/30">
                <Sparkles className="text-star-gold" size={16} />
                <span className="text-xs sm:text-sm font-bold">{config.badgeText}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold mb-5 leading-tight tracking-tight heading-text-shadow">
              {config.heading}
            </h1>
            {config.subheading && <p className="text-lg md:text-xl mb-8 opacity-95">{config.subheading}</p>}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {primaryCta && (
                <Button href={primaryCta.href} variant={primaryCta.variant ?? 'yellow'} size="lg" withArrow>
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Button href={secondaryCta.href} variant={secondaryCta.variant ?? 'outline'} size="lg" withArrow>
                  {secondaryCta.label}
                </Button>
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
                  <Star className="text-white opacity-70" size={14} />
                  <span className="text-xs sm:text-sm font-semibold text-white/70">
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
                <Button href={ROUTES.PACKAGES} variant="yellow" size="lg" withArrow className="w-full sm:w-auto mb-4">
                  {DEFAULT_HOME_STRINGS.VIEW_ALL_PACKAGES}
                </Button>
              </div>
              <div className="space-y-3 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3 text-white/90">
                  <Shield className="text-orbital-green" size={18} />
                  <span className="text-sm font-semibold">{DEFAULT_HOME_STRINGS.TRUST_DBS_STAFF}</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="text-star-gold" size={18} />
                  <span className="text-sm font-semibold">{DEFAULT_HOME_STRINGS.TRUST_SATISFACTION_RATE}</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Award className="text-light-blue-cyan" size={18} />
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
    </Section>
  );
}
