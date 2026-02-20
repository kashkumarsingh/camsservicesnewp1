'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { parentProfileRepository } from '@/infrastructure/http/parent/ParentProfileRepository';
import Button from '@/components/ui/Button';
import { AlertCircle, CheckCircle, User } from 'lucide-react';
import { ROUTES } from '@/utils/routes';
import { ACCOUNT_PAGE } from '@/app/(public)/constants/accountPageConstants';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, refresh } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=${ROUTES.ACCOUNT}`);
      return;
    }

    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setPostcode(user.postcode || '');
    }
  }, [loading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Send all fields explicitly - use null for empty strings so backend can clear them
      const updatePayload: {
        name: string;
        phone?: string;
        address?: string;
        postcode?: string;
      } = {
        name: name.trim(),
      };

      // Always include phone, address, postcode - send undefined if empty to clear them
      updatePayload.phone = phone.trim() || undefined;
      updatePayload.address = address.trim() || undefined;
      updatePayload.postcode = postcode.trim() || undefined;

      await parentProfileRepository.updateProfile(updatePayload);
      
      // Refresh auth data to get updated profile
      await refresh();
      
      // Small delay to ensure refresh completes, then update local state
      setTimeout(() => {
        // The useEffect will automatically update the form when user data changes
        // But we also explicitly update here to ensure it happens
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setAddress(user.address || '');
          setPostcode(user.postcode || '');
        }
      }, 100);
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        ACCOUNT_PAGE.ERROR_DEFAULT;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto" />
          <p className="mt-4 text-gray-600">{ACCOUNT_PAGE.LOADING_MESSAGE}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-card p-8 shadow-2xl border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="text-primary-blue" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-navy-blue">
                {ACCOUNT_PAGE.TITLE}
              </h1>
              <p className="text-sm text-gray-600">
                {ACCOUNT_PAGE.SUBTITLE}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{ACCOUNT_PAGE.SUCCESS_MESSAGE}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy-blue mb-2">
                {ACCOUNT_PAGE.LABEL_FULL_NAME}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-primary-blue focus:ring-primary-blue text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-blue mb-1">
                {ACCOUNT_PAGE.LABEL_EMAIL}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border-2 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                {ACCOUNT_PAGE.EMAIL_CHANGE_NOTE}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-blue mb-2">
                {ACCOUNT_PAGE.LABEL_PHONE}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-primary-blue focus:ring-primary-blue text-gray-900"
                placeholder={ACCOUNT_PAGE.PLACEHOLDER_PHONE}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-blue mb-2">
                {ACCOUNT_PAGE.LABEL_ADDRESS}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-primary-blue focus:ring-primary-blue text-gray-900"
                placeholder={ACCOUNT_PAGE.PLACEHOLDER_ADDRESS}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-blue mb-2">
                {ACCOUNT_PAGE.LABEL_POSTCODE}
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-primary-blue focus:ring-primary-blue text-gray-900"
                placeholder={ACCOUNT_PAGE.PLACEHOLDER_POSTCODE}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/parent')}
              >
                {ACCOUNT_PAGE.BACK_TO_DASHBOARD}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? ACCOUNT_PAGE.SAVING : ACCOUNT_PAGE.SAVE}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


