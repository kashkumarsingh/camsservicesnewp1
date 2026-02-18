'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { ListRowsSkeleton, TableRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { TrainerForm } from './TrainerForm';
import { AdminTrainerAvailabilityPanel } from '@/components/dashboard/admin/AdminTrainerAvailabilityPanel';
import { Calendar, Clock, MapPin } from 'lucide-react';

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

function getStatusBadgeClasses(isActive: boolean) {
  return isActive
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
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
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [hasCertificationsFilter, setHasCertificationsFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
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

      {/* Search + Filters + Export + Create */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="search"
              placeholder="Search by name, email or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {showFilters ? '✕ Hide Filters' : '⚙ Filters'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              📥 Export CSV
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              ➕ Create Trainer
            </button>
          </div>
        </div>

        {/* Advanced Filters (collapsible) */}
        {showFilters && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Advanced Filters
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Active Status
                </label>
                <select
                  value={isActiveFilter}
                  onChange={(e) => {
                    setIsActiveFilter(e.target.value);
                    handleFilterChange({
                      is_active: e.target.value === '' ? undefined : e.target.value === 'true',
                    });
                  }}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="">All Trainers</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Certifications
                </label>
                <select
                  value={hasCertificationsFilter}
                  onChange={(e) => {
                    setHasCertificationsFilter(e.target.value);
                    handleFilterChange({
                      has_certifications:
                        e.target.value === '' ? undefined : e.target.value === 'true',
                    });
                  }}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="">All</option>
                  <option value="true">With Certifications</option>
                  <option value="false">No Certifications</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsActiveFilter('');
                  setHasCertificationsFilter('');
                  handleFilterChange({});
                }}
                className="col-span-1 inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:col-span-2 lg:col-span-1"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trainers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-h-[420px] overflow-x-auto overflow-y-auto text-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Certifications
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Regions
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={6} />
              ) : filteredTrainers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No trainers found.
                  </td>
                </tr>
              ) : (
                filteredTrainers.map((trainer) => (
                  <tr
                    key={trainer.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {trainer.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {trainer.email || '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {trainer.certifications.length > 0
                        ? trainer.certifications
                            .slice(0, 2)
                            .map((cert) => cert.name)
                            .join(', ') +
                          (trainer.certifications.length > 2
                            ? ` +${trainer.certifications.length - 2}`
                            : '')
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {trainer.serviceAreaPostcodes.length > 0
                        ? trainer.serviceAreaPostcodes.slice(0, 2).join(', ') +
                          (trainer.serviceAreaPostcodes.length > 2
                            ? ` +${trainer.serviceAreaPostcodes.length - 2}`
                            : '')
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleActive(trainer.id, trainer.isActive)
                        }
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClasses(
                          trainer.isActive
                        )}`}
                      >
                        {trainer.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setAvailabilityTrainer(trainer)}
                          className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                        >
                          📆 Availability
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTrainer(trainer)}
                          className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTrainer(trainer);
                            setShowEditForm(true);
                          }}
                          className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(trainer.id, trainer.name)
                          }
                          className="inline-flex items-center rounded-md border border-rose-300 px-2 py-1 text-[11px] font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>
            Showing {filteredTrainers.length} of {totalCount} trainer
            {totalCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

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
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClasses(
                        selectedTrainer.isActive
                      )}`}
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
                          s.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                            : s.status === 'cancelled'
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

