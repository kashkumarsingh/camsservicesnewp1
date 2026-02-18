import React from 'react';
import Button from '@/components/ui/Button';

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  badges?: string[];
  variant?: 'default' | 'gradient' | 'solid';
  showStarPattern?: boolean;
}

const CTASection: React.FC<CTASectionProps> = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  badges = ['No obligation', 'Tailored support', '500+ families'],
  variant = 'default',
  showStarPattern = true,
}) => {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'gradient':
      case 'solid':
        return 'bg-[var(--color-primary)] border-t border-[var(--color-primary)]';
      default:
        return 'bg-slate-50 border-t border-slate-200';
    }
  };

  const getTextColor = () => {
    return variant === 'default' ? 'text-slate-900' : 'text-white';
  };

  const getSubtitleColor = () => {
    return variant === 'default' ? 'text-slate-600' : 'opacity-90';
  };

  return (
    <div className={`py-16 ${getBackgroundClass()} text-center p-8 relative overflow-hidden`}>
      {showStarPattern && variant !== 'default' && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/svgs/star.svg')", backgroundRepeat: "repeat", backgroundSize: "30px 30px" }}
        />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h2 className={`text-2xl md:text-3xl font-semibold mb-4 leading-tight ${getTextColor()}`}>
          {title}
        </h2>
        <p className={`text-base md:text-lg mb-6 max-w-2xl mx-auto ${variant === 'default' ? 'text-slate-600' : 'text-white opacity-90'}`}>
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <Button 
            href={primaryCTA.href} 
            variant={variant === 'default' ? 'primary' : 'superPlayful'} 
            size="lg" 
            withArrow
          >
            {primaryCTA.text}
          </Button>
          {secondaryCTA && (
            <Button 
              href={secondaryCTA.href} 
              variant={variant === 'default' ? 'outline' : 'outlineWhite'} 
              size="lg"
              withArrow
            >
              {secondaryCTA.text}
            </Button>
          )}
        </div>
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${variant === 'default' ? 'border-slate-200 bg-white text-slate-600' : 'border-white/30 bg-white/10 text-white'}`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CTASection;

