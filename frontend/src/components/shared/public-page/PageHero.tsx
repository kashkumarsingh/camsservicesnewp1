'use client';

import React from 'react';

/**
 * Common hero for public pages (About, Contact, etc.).
 * No z-index is used so the section stays under the fixed site header (z-header).
 * Content stacks above video/overlays by DOM order only.
 */
export interface PageHeroProps {
  title: string;
  subtitle: string;
  /** Controls whether hero uses video or image background. */
  backgroundMedia?: 'video' | 'image';
  /** Optional video URL (e.g. /videos/space-bg-2.mp4). If not set, only gradient + pattern. */
  videoSrc?: string;
  /** Optional image URL for image background mode. */
  imageSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHero({
  title,
  subtitle,
  backgroundMedia = 'video',
  videoSrc,
  imageSrc,
  children,
  className = '',
}: PageHeroProps) {
  return (
    <section
      className={`relative flex min-h-[78svh] items-center overflow-hidden px-4 pb-16 pt-20 text-white sm:min-h-[82svh] sm:px-6 sm:pb-20 lg:min-h-screen lg:px-8 lg:pb-24 ${className}`}
    >
      {backgroundMedia === 'image' && imageSrc ? (
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={imageSrc}
          alt=""
          aria-hidden
        />
      ) : videoSrc ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={videoSrc}
          loop
          autoPlay
          muted
          playsInline
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 to-light-blue-cyan/20" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('/svgs/star.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="mb-5 font-heading text-4xl font-extrabold leading-tight tracking-tight heading-text-shadow sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base font-light sm:text-lg md:mb-10 md:text-2xl">{subtitle}</p>
        {children && <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-5">{children}</div>}
      </div>
    </section>
  );
}
