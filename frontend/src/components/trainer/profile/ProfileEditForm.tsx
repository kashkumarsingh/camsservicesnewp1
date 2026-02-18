'use client';

import React, { useState, useRef } from 'react';
import { trainerProfileRepository } from '@/infrastructure/http/trainer/TrainerProfileRepository';
import type { TrainerProfile, UpdateTrainerProfileRequest } from '@/core/application/trainer/types';
import { Save, Upload, X, User, Briefcase, MapPin, Award } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ProfileEditFormProps {
  profile: TrainerProfile;
  onUpdate: (profile: TrainerProfile) => void;
  onError: (error: string) => void;
}

export default function ProfileEditForm({ profile, onUpdate, onError }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UpdateTrainerProfileRequest>({
    name: profile.name,
    role: profile.role,
    bio: profile.bio,
    full_description: profile.full_description ?? '',
    specialties: profile.specialties ?? [],
    experience_years: profile.experience_years,
    availability_notes: profile.availability_notes ?? '',
    home_postcode: profile.home_postcode ?? '',
    travel_radius_km: profile.travel_radius_km ?? null,
    service_area_postcodes: profile.service_area_postcodes ?? [],
    preferred_age_groups: profile.preferred_age_groups ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newPostcode, setNewPostcode] = useState('');
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof UpdateTrainerProfileRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties?.includes(newSpecialty.trim())) {
      handleInputChange('specialties', [...(formData.specialties || []), newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    const updated = [...(formData.specialties || [])];
    updated.splice(index, 1);
    handleInputChange('specialties', updated);
  };

  const handleAddPostcode = () => {
    if (newPostcode.trim() && !formData.service_area_postcodes?.includes(newPostcode.trim().toUpperCase())) {
      handleInputChange('service_area_postcodes', [...(formData.service_area_postcodes || []), newPostcode.trim().toUpperCase()]);
      setNewPostcode('');
    }
  };

  const handleRemovePostcode = (index: number) => {
    const updated = [...(formData.service_area_postcodes || [])];
    updated.splice(index, 1);
    handleInputChange('service_area_postcodes', updated);
  };

  const handleAddAgeGroup = () => {
    if (newAgeGroup.trim() && !formData.preferred_age_groups?.includes(newAgeGroup.trim())) {
      handleInputChange('preferred_age_groups', [...(formData.preferred_age_groups || []), newAgeGroup.trim()]);
      setNewAgeGroup('');
    }
  };

  const handleRemoveAgeGroup = (index: number) => {
    const updated = [...(formData.preferred_age_groups || [])];
    updated.splice(index, 1);
    handleInputChange('preferred_age_groups', updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const result = await trainerProfileRepository.uploadImage(file);
      const updatedProfile = { ...profile, image: result.image };
      onUpdate(updatedProfile as TrainerProfile);
    } catch (err: any) {
      onError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  // Note: Profile form is now read-only (admin-only changes)
  // Form submission disabled - trainers cannot change profile

  return (
    <div className="space-y-6">
      {/* Admin Approval Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> All profile changes require admin approval. Please contact admin to update your profile information. You can only change your availability settings.
        </p>
      </div>

      {/* Profile Image */}
      <div className="flex items-center gap-6">
        <div className="relative">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="profile-image"
            disabled
          />
          <label htmlFor="profile-image">
            <Button
              type="button"
              variant="outline"
              disabled
              className="flex items-center gap-2 cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              Upload Image (Admin Only)
            </Button>
          </label>
          <p className="text-sm text-gray-500 mt-1">Contact admin to change profile image</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
          </label>
          <input
            type="text"
            value={formData.name}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role/Title
            <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
          </label>
          <input
            type="text"
            value={formData.role}
            disabled
            placeholder="e.g., Lead Activity Coach"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Bio
          <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
        </label>
        <textarea
          value={formData.bio}
          disabled
          rows={3}
          maxLength={500}
          placeholder="Brief description about yourself (max 500 characters)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
        />
        <p className="text-sm text-gray-500 mt-1">{formData.bio?.length || 0} / 500</p>
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Description
          <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
        </label>
        <textarea
          value={formData.full_description || ''}
          disabled
          rows={6}
          placeholder="Detailed description about your experience and approach"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* Specialties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialties
          <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSpecialty}
            disabled
            placeholder="Add specialty (e.g., SEN Support)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <Button type="button" disabled variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specialties?.map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience
          <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
        </label>
        <input
          type="number"
          value={formData.experience_years}
          disabled
          min={0}
          max={50}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Home Postcode
            <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
          </label>
          <input
            type="text"
            value={formData.home_postcode || ''}
            disabled
            placeholder="e.g., SW1A 1AA"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Radius (km)
            <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
          </label>
          <input
            type="number"
            value={formData.travel_radius_km || ''}
            disabled
            min={0}
            max={200}
            placeholder="e.g., 50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Service Area Postcodes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Area Postcodes
          <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newPostcode}
            disabled
            placeholder="Add postcode"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <Button type="button" disabled variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.service_area_postcodes?.map((postcode, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {postcode}
            </span>
          ))}
        </div>
      </div>

      {/* Preferred Age Groups */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Age Groups
          <span className="text-xs text-gray-500 ml-2">(Contact admin to change)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newAgeGroup}
            disabled
            placeholder="e.g., 5-10, 11-16"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <Button type="button" disabled variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.preferred_age_groups?.map((ageGroup, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {ageGroup}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

