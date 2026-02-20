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
  return (
    <div className="py-16 bg-white border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">{CONTACT_VISIT.TITLE}</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">{CONTACT_VISIT.SUBTITLE}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-card overflow-hidden border border-slate-200 h-80">
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
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-600 font-medium">
                  {CONTACT_VISIT.MAP_COMING_SOON}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-card border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      {CONTACT_VISIT.ADDRESS_LABEL}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {address || CONTACT_VISIT.ADDRESS_COMING_SOON}
                    </p>
                    <Button href="https://maps.google.com" variant="bordered" size="sm" className="mt-2">
                      {CONTACT_VISIT.GET_DIRECTIONS}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-card border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      {CONTACT_VISIT.PARKING_LABEL}
                    </h3>
                    <p className="text-sm text-slate-600">{CONTACT_VISIT.PARKING_DESCRIPTION}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-card border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      {CONTACT_VISIT.BOOK_VISIT_LABEL}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">{CONTACT_VISIT.BOOK_VISIT_DESCRIPTION}</p>
                    <Button href="#contact-form" variant="bordered" size="sm" withArrow>
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
