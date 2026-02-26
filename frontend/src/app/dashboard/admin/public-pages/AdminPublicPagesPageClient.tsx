'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import SideCanvas from '@/components/ui/SideCanvas';
import {
  Breadcrumbs,
  DataTable,
  FilterPanel,
  FilterSection,
  FilterSelect,
  FilterTriggerButton,
  SearchInput,
  type Column,
  type SortDirection,
} from '@/components/dashboard/universal';
import { RowActions, ViewAction, EditAction, DeleteAction } from '@/components/dashboard/universal/RowActions';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ROUTES } from '@/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/utils/appConstants';
import { Switch } from '@/components/ui/Switch';
import { useAdminPages } from '@/interfaces/web/hooks/admin/useAdminPages';
import type { AdminPageDTO, CreatePageDTO } from '@/core/application/admin/dto/AdminPageDTO';
import { PAGE_TYPE_LABELS } from '@/core/application/admin/dto/AdminPageDTO';
import { PageForm } from './PageForm';
import { PageBlocksEditor } from './PageBlocksEditor';
import { Download, Globe, FileWarning } from 'lucide-react';
import { toastManager } from '@/utils/toast';
import { getPublishedBadgeClasses } from '@/utils/statusBadgeHelpers';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { DEFAULT_TABLE_SORT_BY_TITLE } from '@/utils/dashboardConstants';

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
  const [sortKey, setSortKey] = useState<string | null>(DEFAULT_TABLE_SORT_BY_TITLE.sortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_TABLE_SORT_BY_TITLE.sortDirection);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [publishedFilter, setPublishedFilter] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedType, setStagedType] = useState<string>('');
  const [stagedPublished, setStagedPublished] = useState<string>('');

  // UI state
  const [selectedPage, setSelectedPage] = useState<AdminPageDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
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
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    exportPages,
    updateFilters,
  } = useAdminPages({
    type: typeFilter === 'policy-pages' ? undefined : typeFilter || undefined,
    published: publishedFilter === '' ? undefined : publishedFilter === 'true',
  });

  const hasActiveFilters = typeFilter !== '' || publishedFilter !== '';
  const activeFilterCount = (typeFilter ? 1 : 0) + (publishedFilter ? 1 : 0);
  const hasStagedFilters = stagedType !== '' || stagedPublished !== '';
  const stagedFilterCount = (stagedType ? 1 : 0) + (stagedPublished ? 1 : 0);

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedType(typeFilter);
      setStagedPublished(publishedFilter);
    }
  }, [filterPanelOpen, typeFilter, publishedFilter]);

  const handleApplyFilters = useCallback(() => {
    setTypeFilter(stagedType);
    setPublishedFilter(stagedPublished);
    updateFilters({
      type: stagedType === 'policy-pages' ? undefined : stagedType || undefined,
      published: stagedPublished === '' ? undefined : stagedPublished === 'true',
    });
    setFilterPanelOpen(false);
  }, [stagedType, stagedPublished, updateFilters]);

  const handleResetAllStaged = useCallback(() => {
    setStagedType('');
    setStagedPublished('');
  }, []);

  const handleClearFilters = () => {
    setTypeFilter('');
    setPublishedFilter('');
    setSearch('');
    updateFilters({});
  };

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

  const sortedPages = useMemo(() => {
    const list = [...filteredPages];
    const key = sortKey ?? DEFAULT_TABLE_SORT_BY_TITLE.sortKey;
    const dir = sortDirection ?? DEFAULT_TABLE_SORT_BY_TITLE.sortDirection;
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (key === 'title') {
        aVal = a.title ?? '';
        bVal = b.title ?? '';
      } else if (key === 'slug') {
        aVal = a.slug ?? '';
        bVal = b.slug ?? '';
      } else if (key === 'type') {
        aVal = a.type ?? '';
        bVal = b.type ?? '';
      } else if (key === 'views') {
        aVal = a.views ?? 0;
        bVal = b.views ?? 0;
      } else if (key === 'lastUpdated') {
        aVal = a.lastUpdated ?? '';
        bVal = b.lastUpdated ?? '';
      } else {
        aVal = a.title ?? '';
        bVal = b.title ?? '';
      }
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filteredPages, sortKey, sortDirection]);

  const handleSortChange = (key: string | null, dir: 'asc' | 'desc' | null) => {
    setSortKey(key);
    setSortDirection(dir ?? 'asc');
  };

  const pageColumns: Column<AdminPageDTO>[] = useMemo(
    () => [
      { id: 'title', header: 'Title', sortable: true, accessor: (row) => <span className="font-medium text-slate-900 dark:text-slate-50">{row.title}</span> },
      { id: 'slug', header: 'Slug', sortable: true, accessor: (row) => row.slug },
      { id: 'type', header: 'Type', sortable: true, accessor: (row) => PAGE_TYPE_LABELS[row.type] || row.type },
      {
        id: 'status',
        header: 'Status',
        sortable: false,
        accessor: (row) => (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${getPublishedBadgeClasses(row.published)}`}>
            {row.published ? <Globe className="h-3 w-3" /> : <FileWarning className="h-3 w-3" />}
            {row.published ? 'Published' : 'Draft'}
          </span>
        ),
      },
      { id: 'views', header: 'Views', sortable: true, align: 'right', accessor: (row) => row.views.toLocaleString() },
      { id: 'lastUpdated', header: 'Last Updated', sortable: true, accessor: (row) => formatDateTime(row.lastUpdated) },
    ],
    []
  );

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
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Public Pages' },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {BACK_TO_ADMIN_DASHBOARD_LABEL}
            </Link>
          }
        />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Public Pages Management
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Manage public website pages with rich text editing
          </p>
        </div>
      </header>

      {/* Toolbar: Search (left) + Filter + Export + New Page (right) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Title, slug, type…"
          className="min-w-[160px] max-w-[320px] w-full md:w-auto flex-1"
        />
        <div className="flex flex-shrink-0 items-center gap-2">
          <FilterTriggerButton
              ref={filterTriggerRef}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              onClick={() => setFilterPanelOpen(true)}
            />
            <Button type="button" size="sm" variant="bordered" onClick={handleExport} icon={<Download className="h-3.5 w-3.5" />}>
              Export CSV
            </Button>
            <Button size="sm" variant="primary" onClick={() => setIsCreating(true)}>
              + New Page
            </Button>
        </div>
      </div>

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        onApply={handleApplyFilters}
        onResetAll={handleResetAllStaged}
        hasActiveFilters={hasStagedFilters}
        activeFilterCount={stagedFilterCount}
        title="Filter"
        triggerRef={filterTriggerRef}
      >
        <FilterSection
          title="Page Type"
          onReset={() => setStagedType('')}
          isActive={stagedType !== ''}
        >
          <FilterSelect
            label=""
            value={stagedType}
            onChange={setStagedType}
            options={[
              { label: 'All Types', value: '' },
              { label: 'Policy pages (all)', value: 'policy-pages' },
              ...Object.entries(PAGE_TYPE_LABELS).map(([value, label]) => ({ label, value })),
            ]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Status"
          onReset={() => setStagedPublished('')}
          isActive={stagedPublished !== ''}
        >
          <FilterSelect
            label=""
            value={stagedPublished}
            onChange={setStagedPublished}
            options={[
              { label: 'All', value: '' },
              { label: 'Published', value: 'true' },
              { label: 'Draft', value: 'false' },
            ]}
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Pages table */}
      <DataTable<AdminPageDTO>
        columns={pageColumns}
        data={sortedPages}
        isLoading={loading}
        error={error}
        onRetry={() => updateFilters({})}
        emptyTitle={EMPTY_STATE.NO_PAGES_FOUND.title}
        emptyMessage={EMPTY_STATE.NO_PAGES_FOUND.message}
        searchable
        searchPlaceholder="Title, slug, type…"
        searchQuery={search}
        onSearchQueryChange={setSearch}
        sortable
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        renderRowActions={(page) => (
          <RowActions>
            <Switch
              size="sm"
              checked={!!page.published}
              onCheckedChange={() => handleTogglePublish(page)}
              aria-label={page.published ? 'Unpublish page' : 'Publish page'}
              title={page.published ? 'Unpublish' : 'Publish'}
            />
            <ViewAction onClick={() => handleViewDetails(page)} aria-label="View details" title="View details" />
            <EditAction onClick={() => handleEdit(page)} aria-label="Edit" />
            <DeleteAction onClick={() => handleDelete(page)} aria-label="Delete" />
          </RowActions>
        )}
        onRowClick={(page) => handleEdit(page)}
        responsive
      />

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
          <div className="space-y-6">
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
            <PageBlocksEditor
              pageId={selectedPage.id}
              slug={selectedPage.slug}
              blocks={selectedPage.blocks ?? []}
              onCreateBlock={createBlock}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onReorderBlocks={reorderBlocks}
              onBlocksChanged={async () => {
                const full = await getPage(selectedPage.id);
                setSelectedPage(full);
              }}
            />
          </div>
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
                      className={`inline-flex rounded-full px-2 py-0.5 ${getPublishedBadgeClasses(
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
