'use client';

import React, { useState, useCallback } from 'react';
import type {
  CreatePageDTO,
  UpdatePageDTO,
  AdminPageDTO,
  AboutMissionDTO,
  AboutCoreValueDTO,
  AboutSafeguardingDTO,
} from '@/core/application/admin/dto/AdminPageDTO';
import { PAGE_TYPE_LABELS } from '@/core/application/admin/dto/AdminPageDTO';
import { toastManager } from '@/utils/toast';
import { PageContentEditor } from './PageContentEditor';

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
}) => {
  const [submitting, setSubmitting] = useState(false);

  const setSubmittingState = (value: boolean) => {
    setSubmitting(value);
    onSubmittingChange?.(value);
  };
  const [formData, setFormData] = useState<CreatePageDTO | UpdatePageDTO>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    type: initialData?.type || 'other',
    content: initialData?.content || '',
    summary: initialData?.summary || '',
    effective_date: initialData?.effectiveDate || new Date().toISOString().split('T')[0],
    version: initialData?.version || '1.0.0',
    published: initialData?.published ?? false,
    mission: initialData?.mission ?? undefined,
    core_values: initialData?.coreValues ?? undefined,
    coreValuesSectionTitle: initialData?.coreValuesSectionTitle ?? undefined,
    coreValuesSectionSubtitle: initialData?.coreValuesSectionSubtitle ?? undefined,
    safeguarding: initialData?.safeguarding ?? undefined,
  });

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

  const isAboutPage = formData.type === 'about';
  const coreValues = (formData.core_values ?? []) as AboutCoreValueDTO[];

  const setMission = useCallback((mission: AboutMissionDTO | undefined) => {
    setFormData((prev) => ({ ...prev, mission: mission ?? undefined }));
  }, []);

  const setCoreValues = useCallback((values: AboutCoreValueDTO[]) => {
    setFormData((prev) => ({ ...prev, core_values: values.length ? values : undefined }));
  }, []);

  const setSafeguarding = useCallback((safeguarding: AboutSafeguardingDTO | undefined) => {
    setFormData((prev) => ({ ...prev, safeguarding: safeguarding ?? undefined }));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isHome = formData.type === 'home';
    if (!isHome && !formData.content?.trim()) {
      toastManager.error('Page content is required.');
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
          <label htmlFor="type" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Page Type <span className="text-rose-500">*</span>
          </label>
          <select
            id="type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            {Object.entries(PAGE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="summary" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Summary
          </label>
          <textarea
            id="summary"
            rows={2}
            placeholder="Brief summary or meta description"
            value={formData.summary || ''}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Used for SEO meta descriptions (160 characters recommended)
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Content
        </h3>

        <div>
          <label htmlFor="content" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
            Page Content <span className="text-rose-500">*</span>
          </label>
          <PageContentEditor
            value={formData.content ?? ''}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Enter your page content here."
            aria-label="Page content"
          />
        </div>
      </section>

      {/* About page sections – only when type is About */}
      {isAboutPage && (
        <>
          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Our Mission (About page)
            </h3>
            <div className="space-y-2">
              <label htmlFor="missionTitle" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Mission section title
              </label>
              <input
                id="missionTitle"
                type="text"
                placeholder="e.g. Our Mission: Empowering Children and Young People"
                value={formData.mission?.title ?? ''}
                onChange={(e) => setMission({ ...formData.mission, title: e.target.value || undefined })}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
              <label htmlFor="missionDesc" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Mission description (optional)
              </label>
              <textarea
                id="missionDesc"
                rows={3}
                placeholder="Short mission statement or leave blank to use default."
                value={formData.mission?.description ?? ''}
                onChange={(e) => setMission({ ...formData.mission, description: e.target.value || undefined })}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Our Core Values (About page)
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">Section title</label>
              <input
                type="text"
                placeholder="e.g. Our Core Values"
                value={(formData as { coreValuesSectionTitle?: string }).coreValuesSectionTitle ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, coreValuesSectionTitle: e.target.value || undefined }))}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">Section subtitle</label>
              <input
                type="text"
                placeholder="e.g. The principles that guide our every action."
                value={(formData as { coreValuesSectionSubtitle?: string }).coreValuesSectionSubtitle ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, coreValuesSectionSubtitle: e.target.value || undefined }))}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Edit the three value cards. Icon: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">heart</code>, <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">shield</code>, or <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">sprout</code>.
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Value {i + 1}</span>
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Icon (heart, shield, sprout)"
                    value={coreValues[i]?.icon ?? ''}
                    onChange={(e) => {
                      const next = [...coreValues];
                      if (!next[i]) next[i] = { title: '', description: '' };
                      next[i] = { ...next[i], icon: e.target.value || undefined };
                      setCoreValues(next);
                    }}
                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  />
                  <input
                    type="text"
                    placeholder="Title (e.g. Compassionate Care)"
                    value={coreValues[i]?.title ?? ''}
                    onChange={(e) => {
                      const next = [...coreValues];
                      if (!next[i]) next[i] = { title: '', description: '' };
                      next[i] = { ...next[i], title: e.target.value };
                      setCoreValues(next);
                    }}
                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description"
                    value={coreValues[i]?.description ?? ''}
                    onChange={(e) => {
                      const next = [...coreValues];
                      if (!next[i]) next[i] = { title: '', description: '' };
                      next[i] = { ...next[i], description: e.target.value };
                      setCoreValues(next);
                    }}
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Safeguarding (About page)
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Section title (e.g. Our Commitment to Safeguarding)"
                value={formData.safeguarding?.title ?? ''}
                onChange={(e) => setSafeguarding({ ...formData.safeguarding, title: e.target.value || undefined })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
              <input
                type="text"
                placeholder="Subtitle (e.g. Your child's safety and well-being...)"
                value={formData.safeguarding?.subtitle ?? ''}
                onChange={(e) => setSafeguarding({ ...formData.safeguarding, subtitle: e.target.value || undefined })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
              <textarea
                rows={3}
                placeholder="Safeguarding description"
                value={formData.safeguarding?.description ?? ''}
                onChange={(e) => setSafeguarding({ ...formData.safeguarding, description: e.target.value || undefined })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
              <input
                type="text"
                placeholder="Badges, comma-separated (e.g. DBS Checked, First-Aid Certified)"
                value={(formData.safeguarding?.badges ?? []).join(', ')}
                onChange={(e) => {
                  const badges = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setSafeguarding({ ...formData.safeguarding, badges: badges.length ? badges : undefined });
                }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
          </section>
        </>
      )}

      {/* Settings */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Settings
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="version" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Version
            </label>
            <input
              type="text"
              id="version"
              placeholder="1.0.0"
              value={formData.version || ''}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="effectiveDate" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Effective Date
            </label>
            <input
              type="date"
              id="effectiveDate"
              value={formData.effective_date || ''}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={formData.published ?? false}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
          />
          <label htmlFor="published" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Published (visible on website)
          </label>
        </div>
      </section>

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
