'use client';

import React, { useState, useRef } from 'react';
import { trainerProfileRepository } from '@/infrastructure/http/trainer/TrainerProfileRepository';
import type { TrainerProfile, TrainerCertification, UploadQualificationRequest } from '@/core/application/trainer/types';
import { Upload, X, FileText, Trash2, Save, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

interface QualificationsManagerProps {
  profile: TrainerProfile;
  onUpdate: (certifications: TrainerCertification[]) => void;
  onError: (error: string) => void;
}

export default function QualificationsManager({ profile, onUpdate, onError }: QualificationsManagerProps) {
  const [certifications, setCertifications] = useState<TrainerCertification[]>(profile.certifications || []);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear().toString(),
    issuer: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.name.trim()) {
      onError('Please select a file and enter a qualification name');
      return;
    }

    try {
      setUploading(true);
      const request: UploadQualificationRequest = {
        file: selectedFile,
        name: formData.name,
        year: formData.year ? parseInt(formData.year) : null,
        issuer: formData.issuer || null,
      };

      const result = await trainerProfileRepository.uploadQualification(request);
      setCertifications(result.certifications);
      onUpdate(result.certifications);

      // Reset form
      setFormData({ name: '', year: new Date().getFullYear().toString(), issuer: '' });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      onError(err.message || 'Failed to upload qualification');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (certificationId: string) => {
    if (!confirm('Are you sure you want to delete this qualification?')) {
      return;
    }

    try {
      setDeleting(certificationId);
      await trainerProfileRepository.deleteQualification(certificationId);
      const updated = certifications.filter((cert) => cert.id !== certificationId);
      setCertifications(updated);
      onUpdate(updated);
    } catch (err: any) {
      onError(err.message || 'Failed to delete qualification');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications & Certifications</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> All qualification changes require admin approval. Please contact admin to update your qualifications.
          </p>
        </div>

        {/* Upload Form - Disabled */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 opacity-60">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                disabled
                placeholder="e.g., First Aid Certificate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year (Optional)
                </label>
                <input
                  type="number"
                  value={formData.year}
                  disabled
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="e.g., 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer (Optional)
                </label>
                <input
                  type="text"
                  value={formData.issuer}
                  disabled
                  placeholder="e.g., Red Cross"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <Button
              type="button"
              onClick={handleUpload}
              disabled
              className="flex items-center gap-2 cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              Upload Qualification (Admin Only)
            </Button>
          </div>
        </div>

        {/* Certifications List */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Your Qualifications ({certifications.length})
          </h4>

          {certifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No qualifications uploaded yet</p>
              <p className="text-sm text-gray-500 mt-1">Upload your first qualification above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-8 w-8 text-[#0080FF]" />
                    <div>
                      <h5 className="font-medium text-gray-900">{cert.name}</h5>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {cert.year && <span>Year: {cert.year}</span>}
                        {cert.issuer && <span>Issuer: {cert.issuer}</span>}
                        {cert.uploaded_at && (
                          <span>Uploaded: {new Date(cert.uploaded_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      {cert.file_url && (
                        <a
                          href={cert.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0080FF] hover:underline mt-1 inline-block"
                        >
                          View Document →
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(cert.id)}
                    disabled
                    className="text-gray-400 cursor-not-allowed"
                    title="Contact admin to delete qualifications"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

