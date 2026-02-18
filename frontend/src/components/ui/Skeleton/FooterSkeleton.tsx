/**
 * Footer Skeleton Component
 *
 * Provides a reusable skeleton UI that mirrors the footer layout.
 * Used whenever footer data is loading or unavailable so that we maintain
 * consistent shimmer states across the app.
 */

import React from 'react';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';

export default function FooterSkeleton() {
  return (
    <footer className="relative bg-gradient-to-br from-[#1E3A5F] via-[#0080FF] to-[#00D4FF] text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('/svgs/wave-pattern.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative z-10">
        {/* Top Section Skeleton */}
        <div className="border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex justify-center">
              <div className="space-y-4 w-full max-w-2xl">
                <div className="h-6 bg-white/20 rounded w-48 mx-auto animate-pulse" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="h-12 bg-white/20 rounded-2xl animate-pulse" />
                  <div className="h-12 bg-white/20 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            {/* Company Info Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-[72px] w-[180px] bg-white/20 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
              </div>
              <div className="flex gap-4">
                {Array.from({ length: SKELETON_COUNTS.TRUST_INDICATORS }, (_, i) => (
                  <div key={`trust-${i}`} className="h-8 w-24 bg-white/20 rounded-full animate-pulse" />
                ))}
              </div>
              <div className="flex gap-3">
                {Array.from({ length: SKELETON_COUNTS.SOCIAL_LINKS }, (_, i) => (
                  <div key={`social-${i}`} className="h-11 w-11 bg-white/20 rounded-full animate-pulse" />
                ))}
              </div>
            </div>

            {/* Quick Links Skeleton */}
            <div className="space-y-4">
              <div className="h-6 bg-white/20 rounded w-32 animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: SKELETON_COUNTS.QUICK_LINKS }, (_, i) => (
                  <div key={`quick-link-${i}`} className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Services Skeleton */}
            <div className="space-y-4">
              <div className="h-6 bg-white/20 rounded w-40 animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: SKELETON_COUNTS.QUICK_LINKS }, (_, i) => (
                  <div key={`service-link-${i}`} className="h-4 bg-white/10 rounded w-32 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Contact Skeleton */}
            <div className="space-y-4">
              <div className="h-6 bg-white/20 rounded w-40 animate-pulse" />
              <div className="space-y-4">
                {Array.from({ length: SKELETON_COUNTS.CONTACT_ITEMS }, (_, i) => (
                  <div key={`contact-${i}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-32 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Links Skeleton */}
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: SKELETON_COUNTS.LEGAL_LINKS }, (_, i) => (
                <div key={`legal-${i}`} className="h-4 bg-white/10 rounded w-24 animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section Skeleton */}
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="h-4 bg-white/20 rounded w-64 animate-pulse" />
              <div className="h-8 bg-white/20 rounded-full w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

