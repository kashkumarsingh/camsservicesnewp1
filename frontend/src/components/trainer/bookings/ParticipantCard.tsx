'use client';

import React from 'react';
import type { TrainerParticipant } from '@/core/application/trainer/types';
import { Phone, AlertTriangle, Heart, Pill, Utensils, Shield } from 'lucide-react';

interface ParticipantCardProps {
  participant: TrainerParticipant;
  bookingId: number;
}

export default function ParticipantCard({ participant, bookingId }: ParticipantCardProps) {
  const childId = participant.child_id;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{participant.name}</h3>
          {participant.age && (
            <p className="text-sm text-gray-600">Age: {participant.age}</p>
          )}
        </div>
      </div>

      {/* Medical Information Section (Phase 4) */}
      {(participant.medical_info || participant.medical_conditions || participant.allergies || participant.medications || participant.dietary_requirements || participant.special_needs || participant.activity_restrictions) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Medical & Health Information
          </h4>
          <div className="space-y-2">
            {participant.medical_info && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">General Medical Info:</p>
                <p className="text-sm text-gray-600">{participant.medical_info}</p>
              </div>
            )}
            {participant.medical_conditions && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  Medical Conditions:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{participant.medical_conditions}</p>
              </div>
            )}
            {participant.allergies && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  Allergies:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{participant.allergies}</p>
              </div>
            )}
            {participant.medications && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Pill className="h-3 w-3 text-blue-500" />
                  Medications:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{participant.medications}</p>
              </div>
            )}
            {participant.dietary_requirements && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Utensils className="h-3 w-3 text-green-500" />
                  Dietary Requirements:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{participant.dietary_requirements}</p>
              </div>
            )}
            {participant.special_needs && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Special Needs:</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{participant.special_needs}</p>
              </div>
            )}
            {participant.activity_restrictions && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-yellow-500" />
                  Activity Restrictions:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{participant.activity_restrictions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contact (Phase 4) */}
      {participant.emergency_contact && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Phone className="h-4 w-4 text-red-500" />
            Emergency Contact
          </h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">{participant.emergency_contact.name}</span>
              {participant.emergency_contact.relationship && (
                <span className="text-gray-500">({participant.emergency_contact.relationship})</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              <span>{participant.emergency_contact.phone}</span>
            </div>
            {participant.emergency_contact.phone_alt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>Alt: {participant.emergency_contact.phone_alt}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

