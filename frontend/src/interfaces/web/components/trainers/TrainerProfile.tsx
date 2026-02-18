/**
 * Trainer Profile Component
 */

'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import { TrainerDTO } from '@/core/application/trainers';

interface TrainerProfileProps {
  trainer: TrainerDTO;
}

export default function TrainerProfile({ trainer }: TrainerProfileProps) {
  return (
    <article className="bg-white rounded-[30px] shadow-md hover:shadow-2xl border-2 border-gray-200 card-hover-lift transition-all duration-300 p-8">
      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-100">
          <Image 
            src={trainer.image.src} 
            alt={trainer.image.alt} 
            fill 
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-[#1E3A5F] leading-tight">{trainer.name}</h2>
          <p className="text-gray-600 mt-1">{trainer.role}</p>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-amber-500 text-lg">{'★'.repeat(Math.round(trainer.rating))}</span>
            <span className="text-gray-500 text-sm">{trainer.rating.toFixed(1)}/5</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {trainer.certifications.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {trainer.certifications.length} Certifications
          </span>
        )}
        {trainer.specialties.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            {trainer.specialties.length} Specialties
          </span>
        )}
        {trainer.capabilities.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            {trainer.capabilities.length} Capabilities
          </span>
        )}
      </div>

      {trainer.description && (
        <p className="text-gray-800 leading-relaxed">{trainer.description}</p>
      )}

      {trainer.certifications.length > 0 && (
        <section className="mt-8">
          <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">Certifications</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {trainer.certifications.map((certification, index) => (
              <li key={index}>{certification}</li>
            ))}
          </ul>
        </section>
      )}

      {trainer.specialties.length > 0 && (
        <section className="mt-8">
          <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">Specialties</h3>
          <div className="flex flex-wrap gap-3">
            {trainer.specialties.map((specialty, index) => (
              <span key={index} className="bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                {specialty}
              </span>
            ))}
          </div>
        </section>
      )}

      {trainer.capabilities.length > 0 && (
        <section className="mt-8">
          <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {trainer.capabilities.map((capability, index) => (
              <span key={index} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                {capability.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Button href="/contact" variant="primary" size="lg">
          Contact {trainer.name}
        </Button>
      </div>
    </article>
  );
}

