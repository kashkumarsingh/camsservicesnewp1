'use client';

import React from 'react';
import { User, Award, Mail, Phone, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';

interface TrainerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: {
    id?: string | number;
    name: string;
    specialty?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    location?: string;
    bio?: string;
    qualifications?: string[];
  } | null;
  childName?: string;
  bookingId?: string;
  onViewTimeline?: () => void;
}

/**
 * Trainer Info Modal Component
 * 
 * Displays trainer information in a modal dialog.
 * Shows trainer details and provides option to view progress timeline.
 */
export default function TrainerInfoModal({
  isOpen,
  onClose,
  trainer,
  childName,
  bookingId,
  onViewTimeline,
}: TrainerInfoModalProps) {
  if (!isOpen || !trainer) {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Trainer Information"
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
          {onViewTimeline && bookingId && (
            <Button
              onClick={() => {
                onViewTimeline();
                onClose();
              }}
              variant="primary"
              className="flex-1 sm:flex-none"
            >
              View Progress Timeline
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="flex-1 sm:flex-none">
            Close
          </Button>
        </div>
      }
    >
      <div>
          {/* Trainer Profile */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-2xl flex-shrink-0">
              {trainer.avatar || trainer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{trainer.name}</h3>
              {trainer.specialty && (
                <p className="text-sm text-gray-600 mb-3">{trainer.specialty}</p>
              )}
              {childName && (
                <p className="text-sm text-blue-600 font-medium">
                  Assigned to: {getTrainerChildDisplayName(childName)}
                </p>
              )}
            </div>
          </div>

          {/* Trainer Details */}
          <div className="space-y-4 mb-6">
            {trainer.bio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">About</h4>
                <p className="text-gray-600">{trainer.bio}</p>
              </div>
            )}

            {trainer.qualifications && trainer.qualifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">Qualifications</h4>
                <ul className="space-y-1">
                  {trainer.qualifications.map((qual, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trainer.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{trainer.email}</span>
                </div>
              )}
              {trainer.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{trainer.phone}</span>
                </div>
              )}
              {trainer.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{trainer.location}</span>
                </div>
              )}
            </div>
          </div>
      </div>
    </BaseModal>
  );
}
