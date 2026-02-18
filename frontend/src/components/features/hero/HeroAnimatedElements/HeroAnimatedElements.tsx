"use client";

import React from 'react';
import Image from 'next/image';

const HeroAnimatedElements: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Planets/Circles */}
      <div className="absolute w-20 h-20 opacity-70 animate-float" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>
        <Image src="/svgs/planet-1.svg" alt="Planet" fill className="object-contain" sizes="80px" />
      </div>
      <div className="absolute w-16 h-16 opacity-70 animate-float" style={{ top: '30%', left: '80%', animationDelay: '2s' }}>
        <Image src="/svgs/circle.svg" alt="Circle" fill className="object-contain" sizes="64px" />
      </div>
      <div className="absolute w-24 h-24 opacity-70 animate-float" style={{ top: '70%', left: '20%', animationDelay: '4s' }}>
        <Image src="/svgs/planet-3.svg" alt="Planet" fill className="object-contain" sizes="96px" />
      </div>
      <div className="absolute w-12 h-12 opacity-70 animate-float" style={{ top: '50%', left: '50%', animationDelay: '6s' }}>
        <Image src="/svgs/planet-5.svg" alt="Planet" fill className="object-contain" sizes="48px" />
      </div>

      {/* Twinkling Stars */}
      <div className="absolute w-4 h-4 opacity-0 animate-twinkle" style={{ top: '5%', left: '5%', animationDelay: '0.5s' }}>
        <Image src="/svgs/star.svg" alt="Star" fill className="object-contain" sizes="16px" />
      </div>
      <div className="absolute w-5 h-5 opacity-0 animate-twinkle" style={{ top: '15%', left: '90%', animationDelay: '1.5s' }}>
        <Image src="/svgs/star.svg" alt="Star" fill className="object-contain" sizes="20px" />
      </div>
      <div className="absolute w-4 h-4 opacity-0 animate-twinkle" style={{ top: '25%', left: '30%', animationDelay: '2.5s' }}>
        <Image src="/svgs/star.svg" alt="Star" fill className="object-contain" sizes="16px" />
      </div>
      <div className="absolute w-6 h-6 opacity-0 animate-twinkle" style={{ top: '40%', left: '10%', animationDelay: '3.5s' }}>
        <Image src="/svgs/star.svg" alt="Star" fill className="object-contain" sizes="24px" />
      </div>
      <div className="absolute w-5 h-5 opacity-0 animate-twinkle" style={{ top: '60%', left: '70%', animationDelay: '4.5s' }}>
        <Image src="/svgs/star.svg" alt="Star" fill className="object-contain" sizes="20px" />
      </div>
      <div className="absolute w-4 h-4 opacity-0 animate-twinkle" style={{ top: '80%', left: '40%', animationDelay: '5.5s' }}>
        <Image src="/svgs/star.svg" alt="Star" fill className="object-contain" sizes="16px" />
      </div>
    </div>
  );
};

export default HeroAnimatedElements;


