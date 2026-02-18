import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import { OriginalTrainer } from '@/components/features/booking/types';

interface TrainerDetailsProps {
  trainer: OriginalTrainer;
}

const TrainerDetails: React.FC<TrainerDetailsProps> = ({ trainer }) => {
  return (
    <article className="bg-white rounded-[30px] shadow-md hover:shadow-2xl border-2 border-gray-200 card-hover-lift transition-all duration-300 p-8">
      {/* Header: Name, role, rating */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-100">
          <Image 
            src={trainer.imageSrc} 
            alt={trainer.imageAlt} 
            fill 
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-[#1E3A5F] leading-tight">{trainer.title}</h2>
          <p className="text-gray-600 mt-1">{trainer.role}</p>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-amber-500 text-lg">{'★'.repeat(Math.max(0, Math.min(5, trainer.rating || 0)))}</span>
            <span className="text-gray-500 text-sm">{trainer.rating}/5</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        {trainer.certifications && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {trainer.certifications.length} Certifications
          </span>
        )}
        {trainer.specialties && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            {trainer.specialties.length} Specialties
          </span>
        )}
      </div>

      {/* Bio */}
      {trainer.fullDescription && (
        <p className="text-gray-800 leading-relaxed">
          {trainer.fullDescription}
        </p>
      )}

      {/* Certifications */}
      {trainer.certifications && trainer.certifications.length > 0 && (
        <section className="mt-8">
          <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">Certifications</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {trainer.certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Specialties */}
      {trainer.specialties && trainer.specialties.length > 0 && (
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

      {/* CTA */}
      <div className="mt-10 text-center">
        <Button href="/contact" variant="primary" size="lg">
          Contact {trainer.title}
        </Button>
      </div>
    </article>
  );
};

export default TrainerDetails;
