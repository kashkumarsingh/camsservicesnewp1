'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { MapPin, Users, Calendar } from 'lucide-react';
import { CONTACT_VISIT } from './constants';

interface ContactVisitSectionProps {
  mapEmbedUrl: string;
  address: string;
}

export default function ContactVisitSection({ mapEmbedUrl, address }: ContactVisitSectionProps) {
  const displayAddress = address || CONTACT_VISIT.ADDRESS_PLACEHOLDER;

  return (
    <div className="py-20 bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy-blue mb-4 heading-text-shadow">
              {CONTACT_VISIT.TITLE}
            </h2>
            <p className="text-lg text-navy-blue/80 max-w-2xl mx-auto">
              {CONTACT_VISIT.SUBTITLE}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-card overflow-hidden shadow-2xl border border-gray-200 h-96">
              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={CONTACT_VISIT.MAP_TITLE}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 font-medium">
                  {CONTACT_VISIT.MAP_COMING_SOON}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-hover-lift transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-light-blue-cyan text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-blue mb-2">
                      {CONTACT_VISIT.ADDRESS_LABEL}
                    </h3>
                    <p className="text-navy-blue">{displayAddress}</p>
                    <Button
                      href={CONTACT_VISIT.GET_DIRECTIONS_HREF}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-2 border-primary-blue text-primary-blue bg-white hover:bg-primary-blue hover:text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 mt-3 px-4 py-2 text-sm"
                    >
                      {CONTACT_VISIT.GET_DIRECTIONS}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-hover-lift transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-light-blue-cyan text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={24} aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-blue mb-2">
                      {CONTACT_VISIT.PARKING_LABEL}
                    </h3>
                    <p className="text-navy-blue">{CONTACT_VISIT.PARKING_DESCRIPTION}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 card-hover-lift transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-light-blue-cyan text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar size={24} aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-blue mb-2">
                      {CONTACT_VISIT.BOOK_VISIT_LABEL}
                    </h3>
                    <p className="text-navy-blue mb-3">{CONTACT_VISIT.BOOK_VISIT_DESCRIPTION}</p>
                    <Button
                      href="#contact-form"
                      variant="secondary"
                      size="sm"
                      className="rounded-full bg-navy-blue text-white hover:bg-primary-blue hover:shadow-2xl hover:scale-105 transition-all duration-300 px-4 py-2 text-sm"
                      withArrow
                    >
                      {CONTACT_VISIT.SCHEDULE_TOUR}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
