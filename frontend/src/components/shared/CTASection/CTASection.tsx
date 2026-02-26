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
        return 'bg-navy-blue border-t border-navy-blue';
      default:
        return 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-t border-primary-blue/20';
    }
  };

  const getTextColor = () => {
    return variant === 'default' ? 'text-navy-blue' : 'text-white';
  };

  return (
    <div className={`py-16 ${getBackgroundClass()} text-center p-8 relative overflow-hidden`}>
      {showStarPattern && variant !== 'default' && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/svgs/star.svg')", backgroundRepeat: "repeat", backgroundSize: "30px 30px" }}
        />
      )}
      {variant === 'default' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/5 to-light-blue-cyan/5 pointer-events-none z-[1]" aria-hidden />
      )}
      {variant !== 'default' && (
        <div className="absolute inset-0 bg-white opacity-5 hover:opacity-10 transition-opacity duration-500 pointer-events-none z-[1]" aria-hidden />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h2 className={`text-2xl md:text-3xl font-heading font-bold mb-4 leading-tight ${getTextColor()}`}>
          {title}
        </h2>
        <p className={`text-base md:text-lg mb-6 max-w-2xl mx-auto ${variant === 'default' ? 'text-navy-blue/85' : 'text-white/90'}`}>
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <Button 
            href={primaryCTA.href} 
            variant={variant === 'default' ? 'primary' : 'primary'} 
            size="lg" 
            className="rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
            withArrow
          >
            {primaryCTA.text}
          </Button>
          {secondaryCTA && (
            <Button 
              href={secondaryCTA.href} 
              variant={variant === 'default' ? 'outline' : 'outlineWhite'} 
              size="lg"
              className="rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
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
                className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${variant === 'default' ? 'border-primary-blue/30 bg-primary-blue/10 text-navy-blue' : 'border-white/30 bg-white/10 text-white'}`}
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

