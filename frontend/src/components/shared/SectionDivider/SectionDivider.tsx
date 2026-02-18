import React from 'react';

interface SectionDividerProps {
  className?: string;
  topColor?: string; // Color of the section above the divider
  bottomColor?: string; // Color of the section below the divider
}

const SectionDivider: React.FC<SectionDividerProps> = ({ className = '', topColor = 'currentColor', bottomColor = 'transparent' }) => {
  return (
    <div className={`relative w-full h-24 overflow-hidden ${className}`} style={{ backgroundColor: bottomColor }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" fill={topColor} className="absolute bottom-0 left-0 w-full h-full">
        <path d="M 0 -10 L 0 0 C 0 0 0 0 0 0 C 133.33 0 266.67 116.53 400 116.53 C 533.33 116.53 666.67 13.47 800 13.47 C 933.33 13.47 1066.67 89.42 1200 89.42 L 1200 0 L 1200 -10 Z"></path>
      </svg>
    </div>
  );
};

export default SectionDivider;