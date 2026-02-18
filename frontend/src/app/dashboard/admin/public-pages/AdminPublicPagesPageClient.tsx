'use client';

import React, { useMemo, useState } from 'react';
import SideCanvas from '@/components/ui/SideCanvas';
import { TableRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { useAdminPages } from '@/interfaces/web/hooks/admin/useAdminPages';
import type { AdminPageDTO, CreatePageDTO } from '@/core/application/admin/dto/AdminPageDTO';
import { PAGE_TYPE_LABELS } from '@/core/application/admin/dto/AdminPageDTO';
import { PageForm } from './PageForm';
import { Download, Filter, Eye, Edit, Trash2, Globe, FileWarning } from 'lucide-react';
import { toastManager } from '@/utils/toast';

/** Page type slugs shown under public /policies (must match ListPoliciesUseCase). */
const POLICY_PAGE_TYPES = [
  'privacy-policy',
  'terms-of-service',
  'cancellation-policy',
  'cookie-policy',
  'payment-refund-policy',
  'safeguarding-policy',
];
/** Alias for POLICY_PAGE_TYPES (used in filter below). */
const POLICY_TYPES = POLICY_PAGE_TYPES;

function getPublishedBadgeClasses(published: boolean) {
  return published
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
}

function formatDateTime(value: string | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const AdminPublicPagesPageClient: React.FC = () => {
  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [publishedFilter, setPublishedFilter] = useState<string>('');
  
  // UI state
  const [selectedPage, setSelectedPage] = useState<AdminPageDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Data hooks – when "Policy pages" is selected, fetch all and filter client-side
  const {
    pages,
    loading,
    error,
    createPage,
    updatePage,
    deletePage,
    togglePublish,
    getPage,
    exportPages,
    updateFilters,
  } = useAdminPages({
    type: typeFilter === 'policy-pages' ? undefined : typeFilter || undefined,
    published: publishedFilter === '' ? undefined : publishedFilter === 'true',
  });

  // Filter pages by search and by "Policy pages" when that filter is active
  const filteredPages = useMemo(() => {
    let list = pages;
    if (typeFilter === 'policy-pages') {
      list = list.filter((p) => POLICY_TYPES.includes(p.type));
    }
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((page) => {
      return (
        page.title.toLowerCase().includes(term) ||
        page.slug.toLowerCase().includes(term) ||
        page.type.toLowerCase().includes(term)
      );
    });
  }, [pages, search, typeFilter]);

  /**
   * Export to CSV
   */
  const handleExport = async () => {
    try {
      await exportPages();
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to export pages');
    }
  };

  /**
   * Handle delete page
   */
  const handleDelete = async (page: AdminPageDTO) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePage(page.id);
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  /**
   * Handle toggle publish
   */
  const handleTogglePublish = async (page: AdminPageDTO) => {
    try {
      await togglePublish(page.id, { published: !page.published });
      toastManager.success(page.published ? 'Page unpublished.' : 'Page published.');
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to update publish status');
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = async (page: AdminPageDTO) => {
    try {
      const fullPage = await getPage(page.id);
      setSelectedPage(fullPage);
      setIsViewingDetails(true);
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to load page details');
    }
  };

  /**
   * Handle edit
   */
  const handleEdit = async (page: AdminPageDTO) => {
    try {
      const fullPage = await getPage(page.id);
      setSelectedPage(fullPage);
      setIsEditing(true);
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to load page for editing');
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Public Pages Management
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Manage public website pages with rich text editing
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Filter className="h-3 w-3" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              + New Page
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Title, slug, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label htmlFor="typeFilter" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Page Type
              </label>
              <select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setTypeFilter(v);
                  updateFilters({ type: v === 'policy-pages' ? undefined : v || undefined });
                }}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="">All Types</option>
                <option value="policy-pages">Policy pages (all)</option>
                {Object.entries(PAGE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="publishedFilter" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select
                id="publishedFilter"
                value={publishedFilter}
                onChange={(e) => {
                  setPublishedFilter(e.target.value);
                  updateFilters({
                    published: e.target.value === '' ? undefined : e.target.value === 'true',
                  });
                }}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="">All</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>
        )}
      </header>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Pages table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto text-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Title
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Slug
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Type
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Views
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Last Updated
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={7} />
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No pages found.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr
                    key={page.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEdit(page)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEdit(page);
                      }
                    }}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                  >
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-medium text-slate-900 dark:text-slate-50">
                      {page.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {page.slug}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {PAGE_TYPE_LABELS[page.type] || page.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(page);
                        }}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${getPublishedBadgeClasses(
                          page.published
                        )}`}
                        title="Click to toggle"
                      >
                        {page.published ? <Globe className="h-3 w-3" /> : <FileWarning className="h-3 w-3" />}
                        {page.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {formatDateTime(page.lastUpdated)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(page)}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(page)}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(page)}
                          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Page SideCanvas */}
      <SideCanvas
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Page"
        description="Add a new public page to your website"
        footer={
          <div className="flex gap-2">
            <button
              form="page-form-create"
              type="submit"
              disabled={formSubmitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : 'Create Page'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              disabled={formSubmitting}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        }
      >
        <PageForm
          formId="page-form-create"
          mode="create"
          hideFooter
          onSubmittingChange={setFormSubmitting}
          onSubmit={async (data) => {
            await createPage(data as CreatePageDTO);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      </SideCanvas>

      {/* Edit Page SideCanvas */}
      <SideCanvas
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setSelectedPage(null);
        }}
        title={selectedPage ? `Edit ${selectedPage.title}` : 'Edit Page'}
        description="Update page content and settings"
        footer={
          <div className="flex gap-2">
            <button
              form="page-form-edit"
              type="submit"
              disabled={formSubmitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : 'Update Page'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setSelectedPage(null);
              }}
              disabled={formSubmitting}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        }
      >
        {selectedPage && (
          <PageForm
            formId="page-form-edit"
            mode="edit"
            hideFooter
            onSubmittingChange={setFormSubmitting}
            initialData={selectedPage}
            onSubmit={async (data) => {
              await updatePage(selectedPage.id, data);
              setIsEditing(false);
              setSelectedPage(null);
            }}
            onCancel={() => {
              setIsEditing(false);
              setSelectedPage(null);
            }}
          />
        )}
      </SideCanvas>

      {/* View Details SideCanvas */}
      <SideCanvas
        isOpen={isViewingDetails}
        onClose={() => {
          setIsViewingDetails(false);
          setSelectedPage(null);
        }}
        title="Page Details"
      >
        {selectedPage && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Overview</h3>
              <dl className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Title:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedPage.title}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Slug:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedPage.slug}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Type:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {PAGE_TYPE_LABELS[selectedPage.type] || selectedPage.type}
                  </dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Version:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedPage.version}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Views:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {selectedPage.views.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Status:</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getPublishedBadgeClasses(
                        selectedPage.published
                      )}`}
                    >
                      {selectedPage.published ? 'Published' : 'Draft'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {selectedPage.summary && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Summary</h3>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">{selectedPage.summary}</p>
              </div>
            )}

            {selectedPage.content && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Content Preview</h3>
                <div
                  className="prose prose-sm mt-2 max-w-none text-xs dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: selectedPage.content.substring(0, 500) + '...' }}
                />
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Timestamps</h3>
              <dl className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Created:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {formatDateTime(selectedPage.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Last Updated:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {formatDateTime(selectedPage.lastUpdated)}
                  </dd>
                </div>
                {selectedPage.effectiveDate && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Effective Date:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {selectedPage.effectiveDate}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </SideCanvas>
    </section>
  );
};
