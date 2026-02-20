import React from 'react';

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string; // New prop for h2 class
}

const Section: React.FC<SectionProps> = ({ id, title, subtitle, children, className = '', titleClassName = '' }) => {
  return (
    <section id={id} className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && <h2 className={`relative inline-block text-3xl md:text-4xl font-bold text-navy-blue mb-4 ${titleClassName} animate-shimmer`}>{title}</h2>}
            {subtitle && <p className="text-lg text-navy-blue">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;