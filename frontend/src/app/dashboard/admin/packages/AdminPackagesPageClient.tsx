'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import SideCanvas from '@/components/ui/SideCanvas';
import type { AdminPackageDTO, CreatePackageDTO, UpdatePackageDTO } from '@/core/application/admin/dto/AdminPackageDTO';
import { useAdminPackages } from '@/interfaces/web/hooks/admin/useAdminPackages';
import { toastManager } from '@/utils/toast';
import { getActiveBadgeClasses } from '@/utils/statusBadgeHelpers';
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
import { DEFAULT_TABLE_SORT } from '@/utils/dashboardConstants';

type PackageFormData = CreatePackageDTO | UpdatePackageDTO;

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const AdminPackagesPageClient: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedAgeGroup, setStagedAgeGroup] = useState<string>("");
  const [stagedDifficulty, setStagedDifficulty] = useState<string>("");
  const [stagedActive, setStagedActive] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string | null>(DEFAULT_TABLE_SORT.sortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_TABLE_SORT.sortDirection);
  const [selectedPackage, setSelectedPackage] = useState<AdminPackageDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    price: 0,
    hours: 1,
    isActive: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const activeFilterValue = activeFilter === "all" ? undefined : activeFilter === "active";

  const { packages, loading, error, createPackage, updatePackage, deletePackage, refetch } = useAdminPackages({
    isActive: activeFilterValue,
    search: search.trim() || undefined,
  });

  const filtered = useMemo(() => {
    let result = packages;
    if (ageGroupFilter) result = result.filter((pkg) => pkg.ageGroup === ageGroupFilter);
    if (difficultyFilter) result = result.filter((pkg) => pkg.difficultyLevel === difficultyFilter);
    return result;
  }, [packages, ageGroupFilter, difficultyFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const key = sortKey ?? 'name';
    const dir = sortDirection ?? 'asc';
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (key === 'name') {
        aVal = a.name ?? '';
        bVal = b.name ?? '';
      } else if (key === 'price') {
        aVal = a.price ?? 0;
        bVal = b.price ?? 0;
      } else if (key === 'hours') {
        aVal = a.hours ?? 0;
        bVal = b.hours ?? 0;
      } else if (key === 'ageGroup') {
        aVal = a.ageGroup ?? '';
        bVal = b.ageGroup ?? '';
      } else if (key === 'views') {
        aVal = a.views ?? 0;
        bVal = b.views ?? 0;
      } else {
        aVal = a.name ?? '';
        bVal = b.name ?? '';
      }
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDirection]);

  const handleSortChange = (key: string | null, dir: 'asc' | 'desc' | null) => {
    setSortKey(key);
    setSortDirection(dir ?? 'asc');
  };

  const ageGroups = useMemo(() => {
    const groups = packages.map((p) => p.ageGroup).filter(Boolean) as string[];
    return Array.from(new Set(groups)).sort();
  }, [packages]);

  const hasActiveFilters = ageGroupFilter !== '' || difficultyFilter !== '' || activeFilter !== 'all';
  const activeFilterCount = (ageGroupFilter ? 1 : 0) + (difficultyFilter ? 1 : 0) + (activeFilter !== 'all' ? 1 : 0);
  const hasStagedFilters = stagedAgeGroup !== '' || stagedDifficulty !== '' || stagedActive !== 'all';
  const stagedFilterCount = (stagedAgeGroup ? 1 : 0) + (stagedDifficulty ? 1 : 0) + (stagedActive !== 'all' ? 1 : 0);

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedAgeGroup(ageGroupFilter);
      setStagedDifficulty(difficultyFilter);
      setStagedActive(activeFilter);
    }
  }, [filterPanelOpen, ageGroupFilter, difficultyFilter, activeFilter]);

  const handleApplyFilters = useCallback(() => {
    setAgeGroupFilter(stagedAgeGroup);
    setDifficultyFilter(stagedDifficulty);
    setActiveFilter(stagedActive);
    setFilterPanelOpen(false);
  }, [stagedAgeGroup, stagedDifficulty, stagedActive]);

  const handleResetAllStaged = useCallback(() => {
    setStagedAgeGroup('');
    setStagedDifficulty('');
    setStagedActive('all');
  }, []);

  const handleClearFilters = () => {
    setAgeGroupFilter('');
    setDifficultyFilter('');
    setActiveFilter('all');
  };

  const handleCreateClick = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      hours: 1,
      durationWeeks: undefined,
      ageGroup: "",
      difficultyLevel: undefined,
      isActive: false,
      isPopular: false,
    });
    setIsCreating(true);
  };

  const handleEditClick = (pkg: AdminPackageDTO) => {
    setFormData({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description || "",
      price: pkg.price,
      hours: pkg.hours,
      durationWeeks: pkg.durationWeeks || undefined,
      ageGroup: pkg.ageGroup || "",
      difficultyLevel: pkg.difficultyLevel || undefined,
      maxParticipants: pkg.maxParticipants || undefined,
      spotsRemaining: pkg.spotsRemaining || undefined,
      totalSpots: pkg.totalSpots || undefined,
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
    });
    setSelectedPackage(pkg);
    setIsEditing(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isCreating) {
        await createPackage(formData as CreatePackageDTO);
        setIsCreating(false);
        toastManager.success("Package created successfully.");
      } else if (isEditing && selectedPackage) {
        await updatePackage(selectedPackage.id, formData as UpdatePackageDTO);
        setIsEditing(false);
        setSelectedPackage(null);
        toastManager.success("Package updated successfully.");
      }

      setFormData({
        name: "",
        price: 0,
        hours: 1,
        isActive: false,
      });
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      await deletePackage(id);
      if (selectedPackage?.id === id) setSelectedPackage(null);
      toastManager.success("Package deleted successfully.");
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to delete package");
    }
  };

  const columns: Column<AdminPackageDTO>[] = useMemo(
    () => [
      { id: 'name', header: 'Name', sortable: true, accessor: (row) => row.name },
      { id: 'price', header: 'Price', sortable: true, align: 'right', accessor: (row) => `£${row.price}` },
      { id: 'hours', header: 'Hours', sortable: true, align: 'right', accessor: (row) => `${row.hours}h` },
      { id: 'ageGroup', header: 'Age Group', sortable: true, accessor: (row) => row.ageGroup || '—' },
      {
        id: 'status',
        header: 'Status',
        sortable: false,
        accessor: (row) => (
          <span className={`inline-flex rounded-full px-2 py-0.5 ${getActiveBadgeClasses(row.isActive)}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      { id: 'views', header: 'Views', sortable: true, align: 'right', accessor: (row) => row.views },
    ],
    []
  );

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Packages' },
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
          Packages
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage packages with full CRUD operations, filtering, and search capabilities.
        </p>
      </header>

      {/* Toolbar: Search (left) + Filter + New package (right) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, description…"
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
            New package
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
          title="Age group"
          onReset={() => setStagedAgeGroup('')}
          isActive={stagedAgeGroup !== ''}
        >
          <FilterSelect
            label=""
            value={stagedAgeGroup}
            onChange={setStagedAgeGroup}
            options={[
              { label: 'All age groups', value: '' },
              ...ageGroups.map((group) => ({ label: group, value: group })),
            ]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Difficulty"
          onReset={() => setStagedDifficulty('')}
          isActive={stagedDifficulty !== ''}
        >
          <FilterSelect
            label=""
            value={stagedDifficulty}
            onChange={setStagedDifficulty}
            options={[
              { label: 'All difficulty levels', value: '' },
              { label: 'Beginner', value: 'beginner' },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced', value: 'advanced' },
            ]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Status"
          onReset={() => setStagedActive('all')}
          isActive={stagedActive !== 'all'}
        >
          <FilterSelect
            label=""
            value={stagedActive}
            onChange={setStagedActive}
            options={[
              { label: 'All statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

      <div className="flex flex-col gap-3">
        <DataTable<AdminPackageDTO>
          columns={columns}
          data={sorted}
          isLoading={loading}
          error={error}
          onRetry={() => refetch()}
          emptyTitle={EMPTY_STATE.NO_PACKAGES_FOUND.title}
          emptyMessage={EMPTY_STATE.NO_PACKAGES_FOUND.message}
          searchable
          searchPlaceholder="Search by name, description…"
          searchQuery={search}
          onSearchQueryChange={setSearch}
          sortable
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          renderRowActions={(row) => (
          <RowActions>
            <EditAction onClick={() => handleEditClick(row)} aria-label="Edit package" />
            <DeleteAction onClick={() => handleDelete(row.id)} aria-label="Delete package" />
          </RowActions>
        )}
        onRowClick={(row) => setSelectedPackage(row)}
        responsive
      />
      </div>

      {/* Detail View Canvas */}
      <SideCanvas
        isOpen={!!selectedPackage && !isEditing}
        onClose={() => setSelectedPackage(null)}
        title={selectedPackage ? selectedPackage.name : "Package details"}
      >
        {selectedPackage && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
              <Button type="button" size="sm" variant="bordered" onClick={() => handleEditClick(selectedPackage)}>
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive-outline"
                onClick={() => {
                  setSelectedPackage(null);
                  handleDelete(selectedPackage.id);
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
                  <dt className="font-medium">Name</dt>
                  <dd>{selectedPackage.name}</dd>
                </div>
                <div>
                  <dt className="font-medium">Slug</dt>
                  <dd>{selectedPackage.slug}</dd>
                </div>
                <div>
                  <dt className="font-medium">Price</dt>
                  <dd>£{selectedPackage.price}</dd>
                </div>
                <div>
                  <dt className="font-medium">Hours</dt>
                  <dd>{selectedPackage.hours}</dd>
                </div>
                <div>
                  <dt className="font-medium">Age Group</dt>
                  <dd>{selectedPackage.ageGroup || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Difficulty</dt>
                  <dd>{selectedPackage.difficultyLevel || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Description</dt>
                  <dd>{selectedPackage.description || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Views</dt>
                  <dd>{selectedPackage.views}</dd>
                </div>
                <div>
                  <dt className="font-medium">Status</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 ${getActiveBadgeClasses(
                        selectedPackage.isActive
                      )}`}
                    >
                      {selectedPackage.isActive ? "Active" : "Inactive"}
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
          setSelectedPackage(null);
        }}
        title={isCreating ? "Create package" : "Edit package"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Name *
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

          <div>
            <label htmlFor="slug" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Price (£) *
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="hours" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Hours *
            </label>
            <input
              type="number"
              id="hours"
              required
              min="1"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 1 })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="durationWeeks" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Duration (weeks)
            </label>
            <input
              type="number"
              id="durationWeeks"
              min="1"
              value={formData.durationWeeks || ""}
              onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value ? parseInt(e.target.value) : undefined })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="ageGroup" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Age Group
            </label>
            <input
              type="text"
              id="ageGroup"
              value={formData.ageGroup || ""}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="difficultyLevel" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Difficulty Level
            </label>
            <select
              id="difficultyLevel"
              value={formData.difficultyLevel || ""}
              onChange={(e) => setFormData({ ...formData, difficultyLevel: (e.target.value || undefined) as any })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="">Select difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Active
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={formData.isPopular || false}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isPopular" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Popular
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isCreating ? "Create" : "Update"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedPackage(null);
              }}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </SideCanvas>
    </section>
  );
};
