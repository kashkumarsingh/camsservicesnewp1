'use client';

import React, { useState, useEffect } from 'react';
import { User, Award, X } from 'lucide-react';
import BaseModal from '@/components/ui/Modal/BaseModal';
import ProfileEditForm from '@/components/trainer/profile/ProfileEditForm';
import QualificationsManager from '@/components/trainer/profile/QualificationsManager';
import type { TrainerProfile } from '@/core/application/trainer/types';

type SettingsTabType = 'profile' | 'qualifications';

interface TrainerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TrainerProfile | null;
  profileLoading: boolean;
  onProfileUpdate: (profile: TrainerProfile) => void;
  onError: (error: string) => void;
  /**
   * Optional initial tab when opening the modal (e.g. from Actions dropdown).
   */
  initialTab?: SettingsTabType;
}

/**
 * Trainer Settings Modal Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Modal for trainer settings (Profile, Qualifications)
 * Uses BaseModal for consistent modal behaviour
 */
export default function TrainerSettingsModal({
  isOpen,
  onClose,
  profile,
  profileLoading,
  onProfileUpdate,
  onError,
  initialTab,
}: TrainerSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('profile');

  // Reset to the requested initial tab (default: profile) when modal opens.
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab ?? 'profile');
    }
  }, [isOpen, initialTab]);

  const tabs = [
    { id: 'profile' as SettingsTabType, label: 'Profile', icon: User },
    { id: 'qualifications' as SettingsTabType, label: 'Qualifications', icon: Award },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      header={
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Trainer settings
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          {/* Tab Navigation - Sticky within header */}
          <div className="border-b border-gray-200 -mx-4 sm:-mx-5 px-4 sm:px-5">
            <nav className="-mb-px flex space-x-8" aria-label="Settings Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-primary-blue text-primary-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      }
      footer={null}
    >
      <div className="space-y-6">

        {/* Tab Content */}
        {profileLoading ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : profile ? (
          <>
            {activeTab === 'profile' && (
              <ProfileEditForm
                profile={profile}
                onUpdate={onProfileUpdate}
                onError={onError}
              />
            )}

            {activeTab === 'qualifications' && (
              <QualificationsManager
                profile={profile}
                onUpdate={(certs) => {
                  onProfileUpdate({
                    ...profile,
                    certifications: certs,
                  });
                }}
                onError={onError}
              />
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600">Failed to load profile. Please try again.</p>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
