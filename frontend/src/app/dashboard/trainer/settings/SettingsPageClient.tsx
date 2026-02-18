'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { trainerProfileRepository } from '@/infrastructure/http/trainer/TrainerProfileRepository';
import type { TrainerProfile } from '@/core/application/trainer/types';
import { User, Award, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import ProfileEditForm from '@/components/trainer/profile/ProfileEditForm';
import QualificationsManager from '@/components/trainer/profile/QualificationsManager';

type TabType = 'profile' | 'qualifications';

export default function SettingsPageClient() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/trainer/settings');
      return;
    }

    if (!authLoading && user && user.role !== 'trainer') {
      router.push('/dashboard');
      return;
    }

    if (!authLoading && user && user.role === 'trainer' && user.approval_status !== 'approved') {
      router.push('/dashboard/trainer');
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (authLoading || !user || user.role !== 'trainer' || user.approval_status !== 'approved') {
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await trainerProfileRepository.get();
        setProfile(profileData);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, user]);

  const handleProfileUpdate = async (updatedProfile: TrainerProfile) => {
    setProfile(updatedProfile);
  };

  const handleQualificationsUpdate = async (certifications: any[]) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      certifications,
    });
  };

  if (authLoading || loading) {
    return <DashboardSkeleton variant="trainer" />;
  }

  if (!user || user.role !== 'trainer') {
    return null;
  }

  if (user.approval_status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Account Not Approved</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your trainer account must be approved to access settings.
          </p>
          <Button onClick={() => router.push('/dashboard/trainer')} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'qualifications' as TabType, label: 'Qualifications', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-[#0080FF]" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Manage your trainer profile and qualifications</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                      ${
                        activeTab === tab.id
                          ? 'border-[#0080FF] text-[#0080FF]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && profile && (
              <ProfileEditForm
                profile={profile}
                onUpdate={handleProfileUpdate}
                onError={setError}
              />
            )}

            {activeTab === 'qualifications' && profile && (
              <QualificationsManager
                profile={profile}
                onUpdate={handleQualificationsUpdate}
                onError={setError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

