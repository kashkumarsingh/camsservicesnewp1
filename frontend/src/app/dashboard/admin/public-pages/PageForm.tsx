'use client';

import React, { useState } from 'react';
import type {
  CreatePageDTO,
  UpdatePageDTO,
  AdminPageDTO,
} from '@/core/application/admin/dto/AdminPageDTO';
import { toastManager } from '@/dashboard/utils/toast';

// ==========================================================================
// Types
// ==========================================================================

interface PageFormProps {
  mode: 'create' | 'edit';
  initialData?: AdminPageDTO;
  onSubmit: (data: CreatePageDTO | UpdatePageDTO) => Promise<void>;
  onCancel: () => void;
  /** Form id for external submit button (e.g. in sticky footer) */
  formId?: string;
  /** When true, do not render form actions; use footer from parent */
  hideFooter?: boolean;
  /** Notify parent when submit is in progress (for footer button state) */
  onSubmittingChange?: (submitting: boolean) => void;
  /** Notify parent when form data changes (for dirty tracking / debounced auto-save) */
  onFormDataChange?: (data: CreatePageDTO | UpdatePageDTO) => void;
}

// ==========================================================================
// Component
// ==========================================================================

export const PageForm: React.FC<PageFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  formId = 'page-form',
  hideFooter = false,
  onSubmittingChange,
  onFormDataChange,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const setSubmittingState = (value: boolean) => {
    setSubmitting(value);
    onSubmittingChange?.(value);
  };
  const [formData, setFormData] = useState<CreatePageDTO | UpdatePageDTO>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    status: initialData?.status ?? 'draft',
    metaTitle: initialData?.metaTitle ?? undefined,
    metaDescription: initialData?.metaDescription ?? undefined,
    ogImage: initialData?.ogImage ?? undefined,
  });

  React.useEffect(() => {
    onFormDataChange?.(formData);
  }, [formData, onFormDataChange]);

  /**
   * Auto-generate slug from title
   */
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  /**
   * Handle title change and auto-generate slug (only in create mode)
   */
  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
    if (mode === 'create') {
      setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }));
    } else {
      setFormData({ ...formData, title });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toastManager.error('Title is required.');
      return;
    }
    setSubmittingState(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to save page. Please try again.';
      toastManager.error(message);
    } finally {
      setSubmittingState(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4 text-sm">
      {/* Basic Information */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Basic Information
        </h3>

        <div>
          <label htmlFor="title" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Slug <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            URL-friendly version (e.g., privacy-policy)
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Status
          </label>
          <select
            id="status"
            value={'status' in formData ? formData.status ?? 'draft' : 'draft'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="metaTitle" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Meta title
          </label>
          <input
            type="text"
            id="metaTitle"
            placeholder="SEO title"
            value={'metaTitle' in formData ? formData.metaTitle ?? '' : ''}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value || undefined })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>

        <div>
          <label htmlFor="metaDescription" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Meta description
          </label>
          <textarea
            id="metaDescription"
            rows={2}
            placeholder="Brief summary or meta description for SEO"
            value={'metaDescription' in formData ? formData.metaDescription ?? '' : ''}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value || undefined })}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Used for SEO meta descriptions (160 characters recommended)
          </p>
        </div>
      </section>

      {/* Page content is managed via the content editor flow. */}

      {/* Form Actions – hidden when footer is rendered by parent */}
      {!hideFooter && (
        <div className="flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : mode === 'create' ? 'Create Page' : 'Update Page'}
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
      )}
    </form>
  );
};
