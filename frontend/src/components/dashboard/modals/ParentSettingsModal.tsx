'use client';

import React, { useState, useEffect } from 'react';
import { User, X, Save } from 'lucide-react';
import BaseModal from '@/components/ui/Modal/BaseModal';
import Button from '@/components/ui/Button';
import { parentProfileRepository } from '@/infrastructure/http/parent/ParentProfileRepository';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { toastManager } from '@/utils/toast';

interface ParentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Parent Settings Modal Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Modal for parent account settings (Profile)
 * Uses BaseModal for consistent modal behaviour
 */
export default function ParentSettingsModal({
  isOpen,
  onClose,
}: ParentSettingsModalProps) {
  const { user, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
  });

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        postcode: user.postcode || '',
      });
    }
  }, [isOpen, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      const updatePayload: {
        name: string;
        phone?: string;
        address?: string;
        postcode?: string;
      } = {
        name: formData.name.trim(),
      };

      // Always include phone, address, postcode - send undefined if empty to clear them
      updatePayload.phone = formData.phone.trim() || undefined;
      updatePayload.address = formData.address.trim() || undefined;
      updatePayload.postcode = formData.postcode.trim() || undefined;

      await parentProfileRepository.updateProfile(updatePayload);
      
      // Refresh auth data to get updated profile
      await refresh();
      
      toastManager.success('Profile updated successfully');
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Failed to update profile. Please try again.';
      toastManager.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      header={
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Account Settings</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {!user ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                To change email, please contact support.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-transparent"
                placeholder="07123 456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-transparent"
                placeholder="123 High Street, London"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-transparent"
                placeholder="SW1A 1AA"
              />
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}
