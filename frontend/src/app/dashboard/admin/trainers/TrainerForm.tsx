'use client';

import React, { useState } from 'react';
import type {
  CreateTrainerDTO,
  UpdateTrainerDTO,
  AdminTrainerDTO,
} from '@/core/application/admin/dto/AdminTrainerDTO';
import type {
  TrainerCertification,
  UploadQualificationRequest,
} from '@/core/application/trainer/types';
import { toastManager } from '@/utils/toast';

// ==========================================================================
// Types
// ==========================================================================

interface TrainerFormProps {
  mode: 'create' | 'edit';
  initialData?: AdminTrainerDTO;
  onSubmit: (data: CreateTrainerDTO | UpdateTrainerDTO) => Promise<void>;
  onCancel: () => void;
  onUploadImage?: (file: File) => Promise<void>;
  onUploadQualification?: (data: UploadQualificationRequest) => Promise<TrainerCertification[]>;
  onDeleteQualification?: (certificationId: string) => Promise<TrainerCertification[]>;
}

// ==========================================================================
// Component
// ==========================================================================

export const TrainerForm: React.FC<TrainerFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  onUploadImage,
  onUploadQualification,
  onDeleteQualification,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTrainerDTO | UpdateTrainerDTO>({
    name: initialData?.name || '',
    email: mode === 'create' ? '' : undefined,
    password: mode === 'create' ? '' : undefined,
    role: initialData?.role || '',
    bio: initialData?.bio || '',
    full_description: initialData?.fullDescription || '',
    image: initialData?.image || '',
    experience_years: initialData?.experienceYears || 0,
    home_postcode: initialData?.homePostcode || '',
    travel_radius_km: initialData?.travelRadiusKm || 0,
    is_active: initialData?.isActive ?? true,
    is_featured: mode === 'edit' ? initialData?.isFeatured ?? false : undefined,
  });

  // Array fields (stored as comma-separated strings for simplicity)
  const [specialtiesInput, setSpecialtiesInput] = useState(
    initialData?.specialties?.join(', ') || ''
  );
  const [certificationsInput, setCertificationsInput] = useState(
    (initialData?.certifications || [])
      .map((cert) => cert.name)
      .join(', ')
  );
  const [serviceAreasInput, setServiceAreasInput] = useState(
    initialData?.serviceAreaPostcodes?.join(', ') || ''
  );
  const [ageGroupsInput, setAgeGroupsInput] = useState(
    initialData?.preferredAgeGroups?.join(', ') || ''
  );

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Qualifications (file-based certifications)
  const [qualificationForm, setQualificationForm] = useState({
    name: '',
    year: new Date().getFullYear().toString(),
    issuer: '',
  });
  const [qualificationFile, setQualificationFile] = useState<File | null>(null);
  const [uploadingQualification, setUploadingQualification] = useState(false);
  const [localCertifications, setLocalCertifications] = useState<TrainerCertification[]>(
    initialData?.certifications || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Parse comma-separated strings into arrays
      const specialties = specialtiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const certifications = certificationsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .map<TrainerCertification>((name, index) => ({
          id: initialData?.id ? `${initialData.id}-manual-${index}` : `manual-${index}`,
          name,
        }));
      const serviceAreaPostcodes = serviceAreasInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const preferredAgeGroups = ageGroupsInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const submitData = {
        ...formData,
        specialties,
        certifications,
        service_area_postcodes: serviceAreaPostcodes,
        preferred_age_groups: preferredAgeGroups,
      };

      await onSubmit(submitData);
    } catch (err) {
      console.error('Form submission failed:', err);
      toastManager.error('Failed to save trainer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col text-sm space-y-4">
      <div className="flex-1 space-y-4 pb-4">
      {/* Basic Information */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Basic Information
        </h3>

        <div>
          <label htmlFor="name" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        {mode === 'create' && (
          <>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={(formData as CreateTrainerDTO).email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                required
                value={(formData as CreateTrainerDTO).password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="role" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Role
          </label>
          <input
            type="text"
            id="role"
            placeholder="e.g. Sports Coach, Fitness Trainer"
            value={formData.role || ''}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Bio (Short)
          </label>
          <textarea
            id="bio"
            rows={3}
            placeholder="Brief introduction (1-2 sentences)"
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="fullDescription" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Full Description
          </label>
          <textarea
            id="fullDescription"
            rows={5}
            placeholder="Detailed trainer profile and experience"
            value={formData.full_description || ''}
            onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Image URL (optional)
          </label>
          <input
            type="url"
            id="image"
            placeholder="https://example.com/trainer-photo.jpg"
            value={formData.image || ''}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          {mode === 'edit' && onUploadImage && initialData && (
            <div className="mt-3 space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Or upload a profile photo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                }}
                className="mt-1 block w-full text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-200 dark:file:bg-slate-800 dark:file:text-slate-100 dark:hover:file:bg-slate-700"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!imageFile || uploadingImage}
                  onClick={async () => {
                    if (!imageFile || !onUploadImage) return;
                    try {
                      setUploadingImage(true);
                      await onUploadImage(imageFile);
                      setImageFile(null);
                    } catch (err: unknown) {
                      toastManager.error(err instanceof Error ? err.message : 'Failed to upload image');
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploadingImage ? 'Uploading…' : 'Upload Photo'}
                </button>
                {initialData.image && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Current image in use
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Professional Details */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Professional Details
        </h3>

        <div>
          <label htmlFor="experienceYears" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Years of Experience
          </label>
          <input
            type="number"
            id="experienceYears"
            min="0"
            max="99"
            value={formData.experience_years || 0}
            onChange={(e) =>
              setFormData({ ...formData, experience_years: parseInt(e.target.value, 10) || 0 })
            }
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="certifications" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Certifications (text labels)
          </label>
          <input
            type="text"
            id="certifications"
            placeholder="e.g. Level 3 PT, First Aid, DBS Checked (comma-separated)"
            value={certificationsInput}
            onChange={(e) => setCertificationsInput(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Optional: quick text labels. To attach real documents, use the upload section below.
          </p>
        </div>

        {/* Certification documents upload (admin only) */}
        <div className="mt-4 space-y-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Certification documents (upload)
          </h4>

          {mode === 'create' || !onUploadQualification || !initialData ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Save this trainer first, then reopen in Edit mode to upload certificates and documents.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    Qualification name *
                  </label>
                  <input
                    type="text"
                    value={qualificationForm.name}
                    onChange={(e) =>
                      setQualificationForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    Year (optional)
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={qualificationForm.year}
                    onChange={(e) =>
                      setQualificationForm((prev) => ({ ...prev, year: e.target.value }))
                    }
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    Issuer (optional)
                  </label>
                  <input
                    type="text"
                    value={qualificationForm.issuer}
                    onChange={(e) =>
                      setQualificationForm((prev) => ({ ...prev, issuer: e.target.value }))
                    }
                    className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setQualificationFile(file);
                  }}
                  className="block w-full text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-200 dark:file:bg-slate-800 dark:file:text-slate-100 dark:hover:file:bg-slate-700"
                />
                <button
                  type="button"
                  disabled={
                    !qualificationFile ||
                    !qualificationForm.name.trim() ||
                    uploadingQualification
                  }
                  onClick={async () => {
                    if (!qualificationFile || !onUploadQualification || !initialData) {
                      return;
                    }
                    try {
                      setUploadingQualification(true);
                      const payload: UploadQualificationRequest = {
                        file: qualificationFile,
                        name: qualificationForm.name.trim(),
                        year: qualificationForm.year
                          ? parseInt(qualificationForm.year, 10)
                          : undefined,
                        issuer: qualificationForm.issuer || undefined,
                      };
                      const updated = await onUploadQualification(payload);
                      setLocalCertifications(updated);
                      // reset
                      setQualificationForm({
                        name: '',
                        year: new Date().getFullYear().toString(),
                        issuer: '',
                      });
                      setQualificationFile(null);
                    } catch (err: unknown) {
                      toastManager.error(err instanceof Error ? err.message : 'Failed to upload qualification');
                    } finally {
                      setUploadingQualification(false);
                    }
                  }}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploadingQualification ? 'Uploading…' : 'Upload certification'}
                </button>
              </div>

              {localCertifications.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    Existing certifications ({localCertifications.length})
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-200">
                    {localCertifications.map((cert) => (
                      <li
                        key={cert.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{cert.name}</span>
                          <span className="text-2xs text-slate-500 dark:text-slate-400">
                            {cert.year ? `Year: ${cert.year} · ` : ''}
                            {cert.issuer ? `Issuer: ${cert.issuer}` : ''}
                          </span>
                          {cert.file_url && (
                            <a
                              href={cert.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xs text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              View document
                            </a>
                          )}
                        </div>
                        {onDeleteQualification && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!initialData || !onDeleteQualification) return;
                              if (
                                !confirm(
                                  'Are you sure you want to delete this certification?'
                                )
                              ) {
                                return;
                              }
                              try {
                                const updated = await onDeleteQualification(cert.id);
                                setLocalCertifications(updated);
                              } catch (err: unknown) {
                                toastManager.error(err instanceof Error ? err.message : 'Failed to delete certification');
                              }
                            }}
                            className="ml-2 inline-flex items-center rounded-md border border-rose-300 px-2 py-0.5 text-2xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label htmlFor="specialties" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Specialties
          </label>
          <input
            type="text"
            id="specialties"
            placeholder="e.g. Football, Swimming, Tennis (comma-separated)"
            value={specialtiesInput}
            onChange={(e) => setSpecialtiesInput(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Separate multiple specialties with commas
          </p>
        </div>

        <div>
          <label htmlFor="ageGroups" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Preferred Age Groups
          </label>
          <input
            type="text"
            id="ageGroups"
            placeholder="e.g. 5-7 years, 8-12 years, Teenagers (comma-separated)"
            value={ageGroupsInput}
            onChange={(e) => setAgeGroupsInput(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Separate multiple age groups with commas
          </p>
        </div>
      </section>

      {/* Service Areas */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Service Areas
        </h3>

        <div>
          <label htmlFor="homePostcode" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Home Postcode
          </label>
          <input
            type="text"
            id="homePostcode"
            placeholder="e.g. SW1A 1AA"
            value={formData.home_postcode || ''}
            onChange={(e) => setFormData({ ...formData, home_postcode: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="travelRadius" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Travel Radius (km)
          </label>
          <input
            type="number"
            id="travelRadius"
            min="0"
            max="999"
            value={formData.travel_radius_km || 0}
            onChange={(e) =>
              setFormData({ ...formData, travel_radius_km: parseInt(e.target.value, 10) || 0 })
            }
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="serviceAreas" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Service Area Postcodes
          </label>
          <input
            type="text"
            id="serviceAreas"
            placeholder="e.g. SW1, W1, NW1 (comma-separated)"
            value={serviceAreasInput}
            onChange={(e) => setServiceAreasInput(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Separate multiple postcodes with commas
          </p>
        </div>
      </section>

      {/* Status */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Status
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.is_active ?? true}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
          />
          <label htmlFor="isActive" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Active (available for bookings)
          </label>
        </div>

        {mode === 'edit' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={(formData as UpdateTrainerDTO).is_featured ?? false}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <label htmlFor="isFeatured" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Featured (show on homepage)
            </label>
          </div>
        )}
      </section>
      </div>

      {/* Form Actions */}
      <div className="sticky bottom-0 flex gap-2 border-t border-slate-200 bg-white/90 py-3 dark:border-slate-700 dark:bg-slate-900/90 backdrop-blur">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Create Trainer' : 'Update Trainer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
