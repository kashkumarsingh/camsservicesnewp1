'use client';

import React, { useState, useRef } from 'react';
import { trainerActivityLogRepository } from '@/infrastructure/http/trainer/TrainerActivityLogRepository';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PhotoUploadProps {
  activityLogId?: number;
  uploadedPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
}

export default function PhotoUpload({
  activityLogId,
  uploadedPhotos,
  onPhotosChange,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    // If we have an activity log ID, upload to server
    if (activityLogId) {
      for (const file of Array.from(files)) {
        await uploadPhoto(file);
      }
    } else {
      // Otherwise, just preview (will be uploaded when activity log is created)
      const newPhotos: string[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newPhotos.push(result);
          if (newPhotos.length === files.length) {
            onPhotosChange([...uploadedPhotos, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!activityLogId) return;

    try {
      setUploading(true);
      setError(null);

      const response = await trainerActivityLogRepository.uploadPhoto(activityLogId, file);
      onPhotosChange([...uploadedPhotos, response.photo_url]);
    } catch (err: any) {
      console.error('Failed to upload photo:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
          disabled={uploading}
        />
        <label
          htmlFor="photo-upload"
          className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </span>
        </label>
        {uploadedPhotos.length > 0 && (
          <span className="text-sm text-gray-600">
            {uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? 's' : ''} uploaded
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {uploadedPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {uploadedPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Activity photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedPhotos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-2">No photos uploaded yet</p>
          <p className="text-xs text-gray-500">Click "Upload Photos" to add photos</p>
        </div>
      )}
    </div>
  );
}

