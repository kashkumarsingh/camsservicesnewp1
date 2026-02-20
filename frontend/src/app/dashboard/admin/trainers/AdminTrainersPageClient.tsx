'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { useAdminTrainers } from '@/interfaces/web/hooks/admin/useAdminTrainers';
import { useAdminTrainerSchedules } from '@/interfaces/web/hooks/admin/useAdminTrainerSchedules';
import type {
  AdminTrainerDTO,
  CreateTrainerDTO,
  UpdateTrainerDTO,
  AdminTrainersFilters,
} from '@/core/application/admin/dto/AdminTrainerDTO';
import SideCanvas from '@/components/ui/SideCanvas';
import {
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
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { TrainerForm } from './TrainerForm';
import { AdminTrainerAvailabilityPanel } from '@/components/dashboard/admin/AdminTrainerAvailabilityPanel';
import { Calendar, Clock, MapPin, Download } from 'lucide-react';
import { getActiveBadgeClasses } from '@/utils/statusBadgeHelpers';
import { BOOKING_STATUS, DEFAULT_TABLE_SORT } from '@/utils/dashboardConstants';
import Button from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { ListRowsSkeleton } from '@/components/ui/Skeleton';

// ==========================================================================
// Helper Functions
// ==========================================================================

function formatDateTime(value?: string) {
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

// ==========================================================================
// Main Component
// ==========================================================================

function getScheduleDateRange(): { date_from: string; date_to: string } {
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const to = new Date(today);
  to.setMonth(to.getMonth() + 3);
  return { date_from: from, date_to: to.toISOString().slice(0, 10) };
}

interface AdminTrainersPageClientProps {
  initialTrainerId?: string;
}

export const AdminTrainersPageClient: React.FC<AdminTrainersPageClientProps> = ({ initialTrainerId }) => {
  const {
    trainers,
    loading,
    error,
    totalCount,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    activateTrainer,
    exportTrainers,
    updateFilters,
    uploadTrainerImage,
    uploadTrainerQualification,
    deleteTrainerQualification,
  } = useAdminTrainers();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(DEFAULT_TABLE_SORT.sortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_TABLE_SORT.sortDirection);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [hasCertificationsFilter, setHasCertificationsFilter] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedIsActive, setStagedIsActive] = useState<string>('');
  const [stagedCertifications, setStagedCertifications] = useState<string>('');
  const [selectedTrainer, setSelectedTrainer] = useState<AdminTrainerDTO | null>(null);
  const [availabilityTrainer, setAvailabilityTrainer] = useState<AdminTrainerDTO | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<AdminTrainerDTO | null>(null);

  // Filtered trainers based on search
  const filteredTrainers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return trainers;

    return trainers.filter((t) => {
      const name = t.name.toLowerCase();
      const email = t.email?.toLowerCase() ?? '';
      const regions = t.serviceAreaPostcodes.join(', ').toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        regions.includes(term)
      );
    });
  }, [trainers, search]);

  const sortedTrainers = useMemo(() => {
    const list = [...filteredTrainers];
    const key = sortKey ?? DEFAULT_TABLE_SORT.sortKey;
    const dir = sortDirection ?? DEFAULT_TABLE_SORT.sortDirection;
    list.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (key === 'name') {
        aVal = a.name ?? '';
        bVal = b.name ?? '';
      } else if (key === 'email') {
        aVal = a.email ?? '';
        bVal = b.email ?? '';
      } else if (key === 'certifications') {
        aVal = a.certifications?.length ?? 0;
        bVal = b.certifications?.length ?? 0;
      } else if (key === 'status') {
        aVal = a.isActive ? 1 : 0;
        bVal = b.isActive ? 1 : 0;
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
  }, [filteredTrainers, sortKey, sortDirection]);

  const handleSortChange = (key: string | null, dir: 'asc' | 'desc' | null) => {
    setSortKey(key);
    setSortDirection(dir ?? 'asc');
  };

  const trainerColumns: Column<AdminTrainerDTO>[] = useMemo(
    () => [
      { id: 'name', header: 'Name', sortable: true, accessor: (row) => row.name },
      {
        id: 'email',
        header: 'Email',
        sortable: true,
        accessor: (row) => row.email || '—',
      },
      {
        id: 'certifications',
        header: 'Certifications',
        sortable: true,
        accessor: (row) =>
          row.certifications.length > 0
            ? row.certifications
                .slice(0, 2)
                .map((c) => c.name)
                .join(', ') + (row.certifications.length > 2 ? ` +${row.certifications.length - 2}` : '')
            : '—',
      },
      {
        id: 'regions',
        header: 'Regions',
        sortable: false,
        accessor: (row) =>
          row.serviceAreaPostcodes.length > 0
            ? row.serviceAreaPostcodes.slice(0, 2).join(', ') +
              (row.serviceAreaPostcodes.length > 2 ? ` +${row.serviceAreaPostcodes.length - 2}` : '')
            : '—',
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        accessor: (row) => (
          <span className={`inline-flex rounded-full px-2 py-0.5 ${getActiveBadgeClasses(row.isActive)}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
    ],
    []
  );

  const scheduleDateRange = useMemo(() => getScheduleDateRange(), []);
  const scheduleFilters = useMemo(
    () => (selectedTrainer ? { ...scheduleDateRange, per_page: 50 } : undefined),
    [selectedTrainer?.id, scheduleDateRange.date_from, scheduleDateRange.date_to]
  );
  const { schedules, loading: scheduleLoading, error: scheduleError } = useAdminTrainerSchedules(
    selectedTrainer?.id ?? '',
    scheduleFilters
  );

  useEffect(() => {
    if (!initialTrainerId || trainers.length === 0) return;
    const trainer = trainers.find((t) => t.id === initialTrainerId) ?? null;
    setSelectedTrainer(trainer);
  }, [initialTrainerId, trainers]);

  // Handle filter changes
  const handleFilterChange = (filters: AdminTrainersFilters) => {
    updateFilters(filters);
  };

  const hasActiveFilters = isActiveFilter !== '' || hasCertificationsFilter !== '';
  const activeFilterCount = (isActiveFilter ? 1 : 0) + (hasCertificationsFilter ? 1 : 0);
  const hasStagedFilters = stagedIsActive !== '' || stagedCertifications !== '';
  const stagedFilterCount = (stagedIsActive ? 1 : 0) + (stagedCertifications ? 1 : 0);

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedIsActive(isActiveFilter);
      setStagedCertifications(hasCertificationsFilter);
    }
  }, [filterPanelOpen, isActiveFilter, hasCertificationsFilter]);

  const handleApplyFilters = useCallback(() => {
    setIsActiveFilter(stagedIsActive);
    setHasCertificationsFilter(stagedCertifications);
    handleFilterChange({
      is_active: stagedIsActive === '' ? undefined : stagedIsActive === 'true',
      has_certifications: stagedCertifications === '' ? undefined : stagedCertifications === 'true',
    });
    setFilterPanelOpen(false);
  }, [stagedIsActive, stagedCertifications]);

  const handleResetAllStaged = useCallback(() => {
    setStagedIsActive('');
    setStagedCertifications('');
  }, []);

  const handleClearFilters = () => {
    setIsActiveFilter('');
    setHasCertificationsFilter('');
    setSearch('');
    handleFilterChange({});
  };

  // Handle activate/deactivate
  const handleToggleActive = async (trainerId: string, isActive: boolean) => {
    try {
      await activateTrainer(trainerId, { is_active: !isActive });
    } catch (err) {
      console.error('Toggle active failed:', err);
    }
  };

  // Handle delete
  const handleDelete = async (trainerId: string, trainerName: string) => {
    if (!confirm(`Delete trainer "${trainerName}"? This action cannot be undone.`)) return;

    try {
      await deleteTrainer(trainerId);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Handle create
  const handleCreate = async (data: CreateTrainerDTO) => {
    try {
      await createTrainer(data);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Create failed:', err);
    }
  };

  // Handle update
  const handleUpdate = async (trainerId: string, data: UpdateTrainerDTO) => {
    try {
      await updateTrainer(trainerId, data);
      setShowEditForm(false);
      setEditingTrainer(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportTrainers();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Trainers Management
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage trainer profiles, certifications, availability, and schedules
        </p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Toolbar: Search (left) + Filter + Export + Create (right) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or region…"
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
        <Button type="button" size="sm" variant="secondary" onClick={() => setShowCreateForm(true)}>
          Create Trainer
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
          title="Active Status"
          onReset={() => setStagedIsActive('')}
          isActive={stagedIsActive !== ''}
        >
          <FilterSelect
            label=""
            value={stagedIsActive}
            onChange={setStagedIsActive}
            options={[
              { label: 'All Trainers', value: '' },
              { label: 'Active Only', value: 'true' },
              { label: 'Inactive Only', value: 'false' },
            ]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Certifications"
          onReset={() => setStagedCertifications('')}
          isActive={stagedCertifications !== ''}
        >
          <FilterSelect
            label=""
            value={stagedCertifications}
            onChange={setStagedCertifications}
            options={[
              { label: 'All', value: '' },
              { label: 'With Certifications', value: 'true' },
              { label: 'No Certifications', value: 'false' },
            ]}
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

      {/* Trainers Table */}
      <DataTable<AdminTrainerDTO>
        columns={trainerColumns}
        data={sortedTrainers}
        isLoading={loading}
        error={error}
        onRetry={() => updateFilters({})}
        emptyTitle={EMPTY_STATE.NO_TRAINERS_FOUND.title}
        emptyMessage={EMPTY_STATE.NO_TRAINERS_FOUND.message}
        searchable
        searchPlaceholder="Search by name, email or region…"
        searchQuery={search}
        onSearchQueryChange={setSearch}
        sortable
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        renderRowActions={(trainer) => (
          <RowActions>
            <Button
              type="button"
              size="sm"
              variant="bordered"
              onClick={(e) => {
                e?.stopPropagation();
                setAvailabilityTrainer(trainer);
              }}
              className="min-w-0 border-emerald-300 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
              aria-label="Availability"
              title="Availability"
            >
              <Calendar className="h-3 w-3" />
            </Button>
            <ViewAction
              onClick={() => setSelectedTrainer(trainer)}
              aria-label="View trainer"
              title="View"
            />
            <EditAction
              onClick={() => {
                setEditingTrainer(trainer);
                setShowEditForm(true);
              }}
              aria-label="Edit"
            />
            <Switch
              size="sm"
              checked={!!trainer.isActive}
              onCheckedChange={() => handleToggleActive(trainer.id, trainer.isActive)}
              aria-label={trainer.isActive ? 'Deactivate trainer' : 'Activate trainer'}
              title={trainer.isActive ? 'Deactivate' : 'Activate'}
            />
            <DeleteAction
              onClick={() => handleDelete(trainer.id, trainer.name)}
              aria-label="Delete"
            />
          </RowActions>
        )}
        onRowClick={(trainer) => setSelectedTrainer(trainer)}
        responsive
      />

      {/* View Details Side Panel */}
      <SideCanvas
        isOpen={!!selectedTrainer}
        onClose={() => setSelectedTrainer(null)}
        title={selectedTrainer ? selectedTrainer.name : 'Trainer details'}
        description={
          selectedTrainer
            ? 'View trainer details, certifications, and upcoming schedule'
            : undefined
        }
      >
        {selectedTrainer && (
          <div className="space-y-4 text-sm">
            {/* Overview */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Overview
              </h3>
              {selectedTrainer.image && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
                    <Image
                      src={selectedTrainer.image}
                      alt={selectedTrainer.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              <dl className="grid grid-cols-1 gap-1 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Name</dt>
                  <dd>{selectedTrainer.name}</dd>
                </div>
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd>{selectedTrainer.email || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Role</dt>
                  <dd>{selectedTrainer.role || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Status</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 ${getActiveBadgeClasses(selectedTrainer.isActive)}`}
                    >
                      {selectedTrainer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Experience Years</dt>
                  <dd>{selectedTrainer.experienceYears || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Rating</dt>
                  <dd>
                    {selectedTrainer.rating.toFixed(1)} ({selectedTrainer.totalReviews} reviews)
                  </dd>
                </div>
              </dl>
            </section>

            {/* Bio */}
            {selectedTrainer.bio && (
              <section className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Bio
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  {selectedTrainer.bio}
                </p>
              </section>
            )}

            {/* Certifications */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Certifications ({selectedTrainer.certifications.length})
              </h3>
              {selectedTrainer.certifications.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 dark:text-slate-200">
                  {selectedTrainer.certifications.map((cert) => (
                    <li key={cert.id}>
                      <span className="font-medium">{cert.name}</span>
                      {(cert.year || cert.issuer) && (
                        <span className="ml-1 text-[10px] text-slate-500 dark:text-slate-400">
                          {cert.year ? `(${cert.year})` : ''}
                          {cert.year && cert.issuer ? ' · ' : ''}
                          {cert.issuer ?? ''}
                        </span>
                      )}
                      {cert.file_url && (
                        <a
                          href={cert.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-[10px] text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          View document
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No certifications recorded.
                </p>
              )}
            </section>

            {/* Specialties */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Specialties ({selectedTrainer.specialties.length})
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-200">
                {selectedTrainer.specialties.length > 0
                  ? selectedTrainer.specialties.join(', ')
                  : 'No specialties recorded.'}
              </p>
            </section>

            {/* Service Areas */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Service Areas
              </h3>
              <dl className="grid grid-cols-1 gap-1 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Home Postcode</dt>
                  <dd>{selectedTrainer.homePostcode || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Travel Radius</dt>
                  <dd>{selectedTrainer.travelRadiusKm ? `${selectedTrainer.travelRadiusKm} km` : '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Regions</dt>
                  <dd>
                    {selectedTrainer.serviceAreaPostcodes.length > 0
                      ? selectedTrainer.serviceAreaPostcodes.join(', ')
                      : '—'}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Activities */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Activities ({selectedTrainer.activities.length})
              </h3>
              {selectedTrainer.activities.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
                  {selectedTrainer.activities.map((activity) => (
                    <li key={activity.id}>
                      {activity.name}
                      {activity.isPrimary && (
                        <span className="ml-1 text-[10px] text-indigo-600">
                          (Primary)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No activities assigned.
                </p>
              )}
            </section>

            {/* Schedule (upcoming sessions) */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Upcoming schedule
              </h3>
              {scheduleError ? (
                <p className="text-xs text-amber-700 dark:text-amber-300" role="alert">
                  {scheduleError}
                </p>
              ) : scheduleLoading && schedules.length === 0 ? (
                <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading schedule">
                  <ListRowsSkeleton count={3} />
                </div>
              ) : schedules.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming sessions in the next 3 months.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {schedules.slice(0, 20).map((s) => (
                    <li
                      key={s.id}
                      className="rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                        <span>{format(parseISO(s.date), 'EEE d MMM yyyy')}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                        <span>{(s.start_time ?? '').slice(0, 5)} – {(s.end_time ?? '').slice(0, 5)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                        <span>{s.package_name ?? s.activities?.[0]?.name ?? 'Session'}</span>
                        {s.location && <span className="text-slate-500">· {s.location}</span>}
                      </div>
                      <span
                        className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          s.status === BOOKING_STATUS.COMPLETED
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                            : s.status === BOOKING_STATUS.CANCELLED
                              ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {schedules.length > 20 && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Showing 20 of {schedules.length} sessions
                </p>
              )}
            </section>

            {/* Quick Actions */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAvailabilityTrainer(selectedTrainer);
                    setSelectedTrainer(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  📆 View availability
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrainer(selectedTrainer);
                    setShowEditForm(true);
                    setSelectedTrainer(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  ✏️ Edit Trainer
                </button>
              </div>
            </section>

            {/* Audit */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Audit
              </h3>
              <dl className="grid grid-cols-1 gap-1 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Created</dt>
                  <dd>{formatDateTime(selectedTrainer.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium">Last Updated</dt>
                  <dd>{formatDateTime(selectedTrainer.updatedAt)}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </SideCanvas>

      {/* Create Trainer Form */}
      <SideCanvas
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create New Trainer"
        description="Add a new trainer to the system"
      >
        <TrainerForm
          mode="create"
          onSubmit={async (data) => {
            await handleCreate(data as CreateTrainerDTO);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </SideCanvas>

      {/* View availability side panel (calendar: green = available, red = unavailable, absence = scribble) */}
      {availabilityTrainer && (
        <AdminTrainerAvailabilityPanel
          trainer={availabilityTrainer}
          isOpen={!!availabilityTrainer}
          onClose={() => setAvailabilityTrainer(null)}
        />
      )}

      {/* Edit Trainer Form */}
      <SideCanvas
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingTrainer(null);
        }}
        title={editingTrainer ? `Edit ${editingTrainer.name}` : 'Edit Trainer'}
        description="Update trainer information"
      >
        {editingTrainer && (
          <TrainerForm
            mode="edit"
            initialData={editingTrainer}
            onSubmit={async (data) => {
              await handleUpdate(editingTrainer.id, data as UpdateTrainerDTO);
            }}
            onCancel={() => {
              setShowEditForm(false);
              setEditingTrainer(null);
            }}
            onUploadImage={async (file) => {
              const { image } = await uploadTrainerImage(editingTrainer.id, file);
              setEditingTrainer((prev) =>
                prev
                  ? {
                      ...prev,
                      image,
                    }
                  : prev
              );
            }}
            onUploadQualification={async (payload) => {
              const updated = await uploadTrainerQualification(
                editingTrainer.id,
                payload
              );
              setEditingTrainer((prev) =>
                prev
                  ? {
                      ...prev,
                      certifications: updated,
                    }
                  : prev
              );
              return updated;
            }}
            onDeleteQualification={async (certificationId) => {
              const updated = await deleteTrainerQualification(
                editingTrainer.id,
                certificationId
              );
              setEditingTrainer((prev) =>
                prev
                  ? {
                      ...prev,
                      certifications: updated,
                    }
                  : prev
              );
              return updated;
            }}
          />
        )}
      </SideCanvas>
    </section>
  );
};

