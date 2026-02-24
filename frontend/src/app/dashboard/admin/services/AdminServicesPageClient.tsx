'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import SideCanvas from '@/components/ui/SideCanvas';
import type {
  AdminServiceDTO,
  CreateServiceDTO,
  UpdateServiceDTO,
} from '@/core/application/admin/dto/AdminServiceDTO';
import { useAdminServices } from '@/interfaces/web/hooks/admin/useAdminServices';
import { toastManager } from '@/utils/toast';
import { getPublishedBadgeClasses } from '@/utils/statusBadgeHelpers';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
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
import { RowActions, EditAction, DeleteAction } from '@/components/dashboard/universal/RowActions';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ROUTES } from '@/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/utils/appConstants';
import { DEFAULT_TABLE_SORT_BY_TITLE } from '@/utils/dashboardConstants';

type ServiceFormData = CreateServiceDTO | UpdateServiceDTO;

function formatDateTime(value: string | null) {
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

export const AdminServicesPageClient: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedCategory, setStagedCategory] = useState<string>('');
  const [stagedPublished, setStagedPublished] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string | null>(DEFAULT_TABLE_SORT_BY_TITLE.sortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_TABLE_SORT_BY_TITLE.sortDirection);
  const [selectedService, setSelectedService] = useState<AdminServiceDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    slug: '',
    summary: '',
    description: '',
    category: '',
    published: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const publishedFilterValue =
    publishedFilter === 'all' ? undefined : publishedFilter === 'published';

  const { services, loading, error, createService, updateService, deleteService, refetch } =
    useAdminServices({
      published: publishedFilterValue,
      search: search.trim() || undefined,
    });

  const safeServices = Array.isArray(services) ? services : [];

  const filtered = useMemo(() => {
    let result = safeServices;
    if (categoryFilter) {
      result = result.filter((service) => service.category === categoryFilter);
    }
    return result;
  }, [safeServices, categoryFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const key = sortKey ?? 'title';
    const dir = sortDirection ?? 'asc';
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (key === 'title') {
        aVal = a.title ?? '';
        bVal = b.title ?? '';
      } else if (key === 'category') {
        aVal = a.category ?? '';
        bVal = b.category ?? '';
      } else if (key === 'views') {
        aVal = a.views ?? 0;
        bVal = b.views ?? 0;
      } else if (key === 'updatedAt') {
        aVal = a.updatedAt ?? '';
        bVal = b.updatedAt ?? '';
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
  }, [filtered, sortKey, sortDirection]);

  const categories = useMemo(() => {
    const cats = safeServices.map((s) => s.category).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort();
  }, [safeServices]);

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat, value: cat })),
    [categories]
  );

  const hasActiveFilters = categoryFilter !== '' || publishedFilter !== 'all';
  const activeFilterCount = (categoryFilter ? 1 : 0) + (publishedFilter !== 'all' ? 1 : 0);
  const hasStagedFilters = stagedCategory !== '' || stagedPublished !== 'all';
  const stagedFilterCount = (stagedCategory ? 1 : 0) + (stagedPublished !== 'all' ? 1 : 0);

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedCategory(categoryFilter);
      setStagedPublished(publishedFilter);
    }
  }, [filterPanelOpen, categoryFilter, publishedFilter]);

  const handleApplyFilters = useCallback(() => {
    setCategoryFilter(stagedCategory);
    setPublishedFilter(stagedPublished);
    setFilterPanelOpen(false);
  }, [stagedCategory, stagedPublished]);

  const handleResetAllStaged = useCallback(() => {
    setStagedCategory('');
    setStagedPublished('all');
  }, []);

  const handleClearFilters = () => {
    setCategoryFilter('');
    setPublishedFilter('all');
  };

  const handleSortChange = (key: string | null, dir: 'asc' | 'desc' | null) => {
    setSortKey(key);
    setSortDirection(dir ?? 'asc');
  };

  const handleCreateClick = () => {
    setFormData({
      title: '',
      slug: '',
      summary: '',
      description: '',
      category: '',
      published: false,
    });
    setIsCreating(true);
  };

  const handleEditClick = (service: AdminServiceDTO) => {
    setFormData({
      title: service.title,
      slug: service.slug,
      summary: service.summary || '',
      description: service.description || '',
      category: service.category || '',
      published: service.published,
    });
    setSelectedService(service);
    setIsEditing(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isCreating) {
        await createService(formData as CreateServiceDTO);
        setIsCreating(false);
        toastManager.success('Service created successfully.');
      } else if (isEditing && selectedService) {
        await updateService(selectedService.id, formData as UpdateServiceDTO);
        setIsEditing(false);
        setSelectedService(null);
        toastManager.success('Service updated successfully.');
      }
      setFormData({
        title: '',
        slug: '',
        summary: '',
        description: '',
        category: '',
        published: false,
      });
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      if (selectedService?.id === id) setSelectedService(null);
      toastManager.success('Service deleted successfully.');
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  const columns: Column<AdminServiceDTO>[] = useMemo(
    () => [
      {
        id: 'title',
        header: 'Title',
        sortable: true,
        accessor: (row) => (
          <span className="font-medium text-slate-900 dark:text-slate-50">{row.title}</span>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        sortable: true,
        accessor: (row) => row.category || '—',
      },
      {
        id: 'status',
        header: 'Status',
        sortable: false,
        accessor: (row) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 ${getPublishedBadgeClasses(
              row.published
            )}`}
          >
            {row.published ? 'Published' : 'Draft'}
          </span>
        ),
      },
      {
        id: 'views',
        header: 'Views',
        sortable: true,
        align: 'right',
        accessor: (row) => row.views,
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        sortable: true,
        accessor: (row) => formatDateTime(row.updatedAt),
      },
    ],
    []
  );

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Services' },
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
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Services
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage services with full CRUD operations, filtering, and search capabilities.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, summary, description…"
          className="min-w-[160px] max-w-[320px] w-full md:w-auto flex-1"
        />
        <div className="flex flex-shrink-0 items-center gap-2">
          <FilterTriggerButton
            ref={filterTriggerRef}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onClick={() => setFilterPanelOpen(true)}
          />
          <Button type="button" size="sm" variant="primary" onClick={handleCreateClick}>
            New service
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
          title="Category"
          onReset={() => setStagedCategory('')}
          isActive={stagedCategory !== ''}
        >
          <FilterSelect
            label=""
            value={stagedCategory}
            onChange={setStagedCategory}
            options={[{ label: 'All categories', value: '' }, ...categoryOptions]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Status"
          onReset={() => setStagedPublished('all')}
          isActive={stagedPublished !== 'all'}
        >
          <FilterSelect
            label=""
            value={stagedPublished}
            onChange={setStagedPublished}
            options={[
              { label: 'All statuses', value: 'all' },
              { label: 'Published', value: 'published' },
              { label: 'Draft', value: 'draft' },
            ]}
            defaultValue="all"
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

      <div className="flex flex-col gap-3">
        <DataTable<AdminServiceDTO>
          columns={columns}
          data={sorted}
          isLoading={loading}
          error={error}
          onRetry={() => refetch()}
          emptyTitle={EMPTY_STATE.NO_SERVICES_FOUND.title}
          emptyMessage={EMPTY_STATE.NO_SERVICES_FOUND.message}
          sortable
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          renderRowActions={(row) => (
            <RowActions>
              <EditAction onClick={() => handleEditClick(row)} tooltip="Edit" />
              <DeleteAction onClick={() => handleDelete(row.id)} tooltip="Delete" />
            </RowActions>
          )}
          onRowClick={(row) => setSelectedService(row)}
          responsive
        />
      </div>

      {/* Detail View Canvas */}
      <SideCanvas
        isOpen={!!selectedService && !isEditing}
        onClose={() => setSelectedService(null)}
        title={selectedService ? selectedService.title : 'Service details'}
      >
        {selectedService && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
              <Button type="button" size="sm" variant="bordered" onClick={() => handleEditClick(selectedService)}>
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive-outline"
                onClick={() => {
                  setSelectedService(null);
                  handleDelete(selectedService.id);
                }}
              >
                Delete
              </Button>
            </div>
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Overview
              </h3>
              <dl className="grid grid-cols-1 gap-2 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Title</dt>
                  <dd>{selectedService.title}</dd>
                </div>
                <div>
                  <dt className="font-medium">Slug</dt>
                  <dd>{selectedService.slug}</dd>
                </div>
                <div>
                  <dt className="font-medium">Category</dt>
                  <dd>{selectedService.category || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Summary</dt>
                  <dd>{selectedService.summary || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Views</dt>
                  <dd>{selectedService.views}</dd>
                </div>
                <div>
                  <dt className="font-medium">Published</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 ${getPublishedBadgeClasses(
                        selectedService.published
                      )}`}
                    >
                      {selectedService.published ? 'Published' : 'Draft'}
                    </span>
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </SideCanvas>

      {/* Create/Edit Form Canvas */}
      <SideCanvas
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedService(null);
        }}
        title={isCreating ? 'Create service' : 'Edit service'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Slug
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="summary"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Summary
            </label>
            <textarea
              id="summary"
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="published"
              className="text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Published
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedService(null);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </SideCanvas>
    </section>
  );
};
