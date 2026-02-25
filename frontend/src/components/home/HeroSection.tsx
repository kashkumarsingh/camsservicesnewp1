'use client';

import Link from 'next/link';
import Section from '@/components/layout/Section';
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

  const heroButtonBase =
    'rounded-full font-semibold font-bold transition-all duration-300 transform inline-flex items-center justify-center space-x-2 cursor-pointer px-8 py-4 text-lg w-full sm:w-auto group hover:shadow-2xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-blue';

  const heroButtonPrimary =
    'bg-gradient-to-r from-primary-blue to-navy-blue text-white hover:from-primary-blue hover:to-light-blue-cyan border-0';
  const heroButtonSecondary =
    'bg-white text-primary-blue border-2 border-primary-blue hover:bg-white/95 hover:border-light-blue-cyan';
  const heroButtonGradient =
    'bg-gradient-to-r from-orbital-green to-star-gold text-navy-blue hover:from-star-gold hover:to-orbital-green border-0';
  return (
    <Section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-primary-blue to-navy-blue">
      <video className="absolute inset-0 w-full h-full object-cover z-0" src={heroVideo} loop autoPlay muted playsInline />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/70 to-navy-blue/85 z-10" aria-hidden />
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold mb-5 leading-tight tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
              {config.heading}
            </h1>
            {config.subheading && <p className="text-lg md:text-xl mb-8 text-white opacity-95 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">{config.subheading}</p>}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {primaryCta && (
                <Link href={primaryCta.href} className={`${heroButtonBase} ${heroButtonPrimary}`}>
                  <span>{primaryCta.label}</span>
                  <ArrowRight size={20} className="text-white transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href} className={`${heroButtonBase} ${heroButtonSecondary}`}>
                  <span>{secondaryCta.label}</span>
                  <ArrowRight size={20} className="text-primary-blue transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
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
                <Link href={ROUTES.PACKAGES} className={`${heroButtonBase} ${heroButtonGradient} mb-4`}>
                  <span>{DEFAULT_HOME_STRINGS.VIEW_ALL_PACKAGES}</span>
                  <ArrowRight size={20} className="text-navy-blue transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
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
    </Section>
  );
}
