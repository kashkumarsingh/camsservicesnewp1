'use client';

import React from 'react';

/**
 * Common hero for public pages (About, Home, etc.).
 * Reusable: pass title, subtitle, optional video and children (e.g. CTAs).
 */
export interface PageHeroProps {
  title: string;
  subtitle: string;
  /** Optional video URL (e.g. /videos/space-bg-2.mp4). If not set, only gradient + pattern. */
  videoSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHero({ title, subtitle, videoSrc, children, className = '' }: PageHeroProps) {
  return (
    <section
      className={`relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-screen flex items-center ${className}`}
    >
      {videoSrc && (
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={videoSrc}
          loop
          autoPlay
          muted
          playsInline
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 to-light-blue-cyan/20 z-10" />
      <div
        className="absolute inset-0 z-10 opacity-10"
        style={{
          backgroundImage: "url('/svgs/star.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">{subtitle}</p>
        {children && <div className="flex flex-col sm:flex-row justify-center gap-5">{children}</div>}
      </div>
    </section>
  );
}
