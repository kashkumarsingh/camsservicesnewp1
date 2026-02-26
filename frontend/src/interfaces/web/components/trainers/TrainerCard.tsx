/**
 * Trainer Card Component
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { TrainerDTO } from '@/core/application/trainers';

interface TrainerCardProps {
  trainer: TrainerDTO;
}

export default function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <Link href={`/trainers/${trainer.slug}`} className="group block rounded-card border-2 border-primary-blue/20 overflow-hidden bg-white shadow-card card-hover-lift transition-shadow">
      <div className="relative w-full aspect-[4/3]">
        <Image 
          src={trainer.image.src} 
          alt={trainer.image.alt} 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="text-star-gold fill-star-gold" size={14} />
            <span className="text-xs text-white/90">{trainer.rating}/5</span>
          </div>
          <h3 className="text-lg font-heading font-bold text-white mb-0.5">{trainer.name}</h3>
          <p className="text-sm text-white/80">{trainer.role}</p>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between border-t border-primary-blue/20">
        <div className="flex flex-wrap gap-1.5">
          {trainer.certifications.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-blue/10 text-navy-blue">
              {trainer.certifications.length} certs
            </span>
          )}
          {trainer.specialties.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-blue/10 text-navy-blue">
              {trainer.specialties.length} specialties
            </span>
          )}
        </div>
        <span className="text-navy-blue/80 text-sm font-medium group-hover:text-navy-blue">View profile →</span>
      </div>
    </Link>
  );
}

