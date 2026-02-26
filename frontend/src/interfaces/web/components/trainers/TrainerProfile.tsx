/**
 * Trainer Profile Component
 */

'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import { TrainerDTO } from '@/core/application/trainers';
import { ROUTES } from '@/utils/routes';

interface TrainerProfileProps {
  trainer: TrainerDTO;
}

export default function TrainerProfile({ trainer }: TrainerProfileProps) {
  return (
    <article className="bg-white rounded-card shadow-card border-2 border-primary-blue/20 card-hover-lift transition-all duration-300 p-8">
      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-blue/20">
          <Image 
            src={trainer.image.src} 
            alt={trainer.image.alt} 
            fill 
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-heading font-bold text-navy-blue leading-tight">{trainer.name}</h2>
          <p className="text-navy-blue/80 mt-1">{trainer.role}</p>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-star-gold text-lg">{'★'.repeat(Math.round(trainer.rating))}</span>
            <span className="text-navy-blue/80 text-sm">{trainer.rating.toFixed(1)}/5</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {trainer.certifications.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-blue/10 text-navy-blue border border-primary-blue/30">
            {trainer.certifications.length} Certifications
          </span>
        )}
        {trainer.specialties.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-blue/10 text-navy-blue border border-primary-blue/30">
            {trainer.specialties.length} Specialties
          </span>
        )}
        {trainer.capabilities.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-blue/10 text-navy-blue border border-primary-blue/30">
            {trainer.capabilities.length} Capabilities
          </span>
        )}
      </div>

      {trainer.description && (
        <p className="text-navy-blue/80 leading-relaxed">{trainer.description}</p>
      )}

      {trainer.certifications.length > 0 && (
        <section className="mt-8">
          <h3 className="text-2xl font-heading font-bold text-navy-blue mb-4">Certifications</h3>
          <ul className="list-disc list-inside text-navy-blue/80 space-y-2">
            {trainer.certifications.map((certification, index) => (
              <li key={index}>{certification}</li>
            ))}
          </ul>
        </section>
      )}

      {trainer.specialties.length > 0 && (
        <section className="mt-8">
          <h3 className="text-2xl font-heading font-bold text-navy-blue mb-4">Specialties</h3>
          <div className="flex flex-wrap gap-3">
            {trainer.specialties.map((specialty, index) => (
              <span key={index} className="bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                {specialty}
              </span>
            ))}
          </div>
        </section>
      )}

      {trainer.capabilities.length > 0 && (
        <section className="mt-8">
          <h3 className="text-2xl font-heading font-bold text-navy-blue mb-4">Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {trainer.capabilities.map((capability, index) => (
              <span key={index} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-blue/10 text-navy-blue border border-primary-blue/30">
                {capability.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Button href={ROUTES.CONTACT} variant="primary" size="lg">
          Contact {trainer.name}
        </Button>
      </div>
    </article>
  );
}

