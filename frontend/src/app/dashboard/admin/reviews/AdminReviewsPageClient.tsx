'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Breadcrumbs,
  DataTable,
  EmptyState,
  FilterPanel,
  FilterSection,
  FilterSelect,
  FilterTriggerButton,
  SearchInput,
} from '@/components/dashboard/universal';
import { RowActions, EditAction, DeleteAction } from '@/components/dashboard/universal/RowActions';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import { BaseModal } from '@/components/ui/Modal';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import { useAdminReviewSources, useAdminExternalReviews, useAdminTestimonials } from '@/interfaces/web/hooks/admin/useAdminReviews';
import type {
  AdminReviewSourceDTO,
  AdminExternalReviewDTO,
  AdminTestimonialDTO,
  CreateReviewSourceDTO,
  CreateTestimonialDTO,
} from '@/core/application/admin/dto/AdminReviewDTO';
import { toastManager } from '@/dashboard/utils/toast';
import { EMPTY_STATE } from '@/dashboard/utils/emptyStateConstants';
import { SKELETON_COUNTS } from '@/shared/utils/skeletonConstants';
import { TableRowsSkeleton } from '@/components/ui/Skeleton';
import { Star, RefreshCw, Eye, EyeOff, MessageSquarePlus, Plus } from 'lucide-react';
import type { Column } from '@/components/dashboard/universal/DataTable';

const BREADCRUMBS = [
  { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
  { label: 'Reviews', href: ROUTES.DASHBOARD_ADMIN_REVIEWS },
];

const PROVIDER_OPTIONS = [
  { label: 'All providers', value: '' },
  { label: 'Google', value: 'google' },
  { label: 'Trustpilot', value: 'trustpilot' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function truncate(str: string | null, max: number): string {
  if (!str) return '—';
  if (str.length <= max) return str;
  return str.slice(0, max).trim() + '…';
}

export default function AdminReviewsPageClient() {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedProvider, setStagedProvider] = useState('');
  const [page, setPage] = useState(1);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null);
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [testimonialEditing, setTestimonialEditing] = useState<AdminTestimonialDTO | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<CreateTestimonialDTO>({
    authorName: '',
    authorRole: null,
    quote: '',
    rating: null,
    sourceType: 'manual',
    sourceLabel: null,
    sourceUrl: null,
    published: true,
  });
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false);

  const { sources, loading: sourcesLoading, error: sourcesError, refetch: refetchSources, syncSource, createSource } = useAdminReviewSources({
    provider: providerFilter || undefined,
  });

  const [reviewSourceModalOpen, setReviewSourceModalOpen] = useState(false);
  const [reviewSourceForm, setReviewSourceForm] = useState<CreateReviewSourceDTO>({
    provider: 'google',
    displayName: '',
    locationId: null,
    apiKey: null,
    apiSecret: null,
    syncFrequencyMinutes: 1440,
    isActive: true,
  });
  const [reviewSourceSubmitting, setReviewSourceSubmitting] = useState(false);

  const {
    reviews,
    meta,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
    updateReview,
    promoteToTestimonial,
  } = useAdminExternalReviews({
    provider: providerFilter || undefined,
    search: search.trim() || undefined,
    page,
    perPage: 15,
  });

  const {
    testimonials,
    meta: testimonialMeta,
    loading: testimonialsLoading,
    error: testimonialsError,
    refetch: refetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  } = useAdminTestimonials({ page: testimonialPage, perPage: 10 });

  const hasActiveFilters = providerFilter !== '';
  const activeFilterCount = providerFilter ? 1 : 0;

  useEffect(() => {
    if (filterPanelOpen) setStagedProvider(providerFilter);
  }, [filterPanelOpen, providerFilter]);

  const handleApplyFilters = useCallback(() => {
    setProviderFilter(stagedProvider);
    setPage(1);
    setFilterPanelOpen(false);
  }, [stagedProvider]);

  const handleSync = useCallback(
    async (id: string) => {
      setSyncingId(id);
      try {
        await syncSource(id);
        toastManager.success('Sync started. Reviews will update shortly.');
        refetchReviews();
      } catch {
        toastManager.error('Failed to start sync.');
      } finally {
        setSyncingId(null);
      }
    },
    [syncSource, refetchReviews]
  );

  const handleToggleVisible = useCallback(
    async (review: AdminExternalReviewDTO) => {
      setTogglingVisibilityId(review.id);
      try {
        await updateReview(review.id, { isVisible: !review.isVisible });
        toastManager.success(review.isVisible ? 'Review hidden from home page.' : 'Review shown on home page.');
      } catch {
        toastManager.error('Failed to update visibility.');
      } finally {
        setTogglingVisibilityId(null);
      }
    },
    [updateReview]
  );

  const handlePromote = useCallback(
    async (review: AdminExternalReviewDTO) => {
      if (review.hasTestimonial) return;
      setPromotingId(review.id);
      try {
        await promoteToTestimonial(review.id);
        toastManager.success('Review promoted to testimonial.');
        refetchReviews();
      } catch {
        toastManager.error('Failed to promote to testimonial.');
      } finally {
        setPromotingId(null);
      }
    },
    [promoteToTestimonial, refetchReviews]
  );

  const openAddReviewSourceModal = useCallback(() => {
    setReviewSourceForm({
      provider: 'google',
      displayName: '',
      locationId: null,
      apiKey: null,
      apiSecret: null,
      syncFrequencyMinutes: 1440,
      isActive: true,
    });
    setReviewSourceModalOpen(true);
  }, []);

  const closeReviewSourceModal = useCallback(() => {
    setReviewSourceModalOpen(false);
  }, []);

  const handleReviewSourceSubmit = useCallback(async () => {
    const displayName = reviewSourceForm.displayName.trim();
    if (!displayName) {
      toastManager.error('Display name is required.');
      return;
    }
    setReviewSourceSubmitting(true);
    try {
      await createSource({
        provider: reviewSourceForm.provider,
        displayName,
        locationId: reviewSourceForm.locationId?.trim() || null,
        apiKey: reviewSourceForm.apiKey?.trim() || null,
        apiSecret: reviewSourceForm.apiSecret?.trim() || null,
        syncFrequencyMinutes: reviewSourceForm.syncFrequencyMinutes ?? 1440,
        isActive: reviewSourceForm.isActive ?? true,
      });
      toastManager.success('Review source added. Run Sync to import reviews.');
      closeReviewSourceModal();
      refetchSources();
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to add review source');
    } finally {
      setReviewSourceSubmitting(false);
    }
  }, [reviewSourceForm, createSource, closeReviewSourceModal, refetchSources]);

  const openAddTestimonialModal = useCallback(() => {
    setTestimonialEditing(null);
    setTestimonialForm({
      authorName: '',
      authorRole: null,
      quote: '',
      rating: null,
      sourceType: 'manual',
      sourceLabel: null,
      sourceUrl: null,
      published: true,
    });
    setTestimonialModalOpen(true);
  }, []);

  const openEditTestimonialModal = useCallback((t: AdminTestimonialDTO) => {
    setTestimonialEditing(t);
    setTestimonialForm({
      authorName: t.authorName,
      authorRole: t.authorRole ?? null,
      quote: t.quote,
      rating: t.rating ?? null,
      sourceLabel: t.sourceLabel ?? null,
      sourceUrl: t.sourceUrl ?? null,
      published: t.published,
    });
    setTestimonialModalOpen(true);
  }, []);

  const closeTestimonialModal = useCallback(() => {
    setTestimonialModalOpen(false);
    setTestimonialEditing(null);
  }, []);

  const handleTestimonialSubmit = useCallback(async () => {
    const authorName = testimonialForm.authorName.trim();
    const quote = testimonialForm.quote.trim();
    if (!authorName || !quote) {
      toastManager.error('Author name and quote are required.');
      return;
    }
    setTestimonialSubmitting(true);
    try {
      if (testimonialEditing) {
        await updateTestimonial(testimonialEditing.id, {
          authorName,
          authorRole: testimonialForm.authorRole?.trim() || null,
          quote,
          rating: testimonialForm.rating ?? null,
          sourceLabel: testimonialForm.sourceLabel?.trim() || null,
          sourceUrl: testimonialForm.sourceUrl?.trim() || null,
          published: testimonialForm.published,
        });
        toastManager.success('Testimonial updated.');
      } else {
        await createTestimonial({
          authorName,
          authorRole: testimonialForm.authorRole?.trim() || null,
          quote,
          rating: testimonialForm.rating ?? null,
          sourceType: 'manual',
          sourceLabel: testimonialForm.sourceLabel?.trim() || null,
          sourceUrl: testimonialForm.sourceUrl?.trim() || null,
          published: testimonialForm.published,
        });
        toastManager.success('Testimonial added.');
      }
      closeTestimonialModal();
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to save testimonial');
    } finally {
      setTestimonialSubmitting(false);
    }
  }, [testimonialForm, testimonialEditing, createTestimonial, updateTestimonial, closeTestimonialModal]);

  const handleDeleteTestimonial = useCallback(
    async (t: AdminTestimonialDTO) => {
      if (!confirm(`Delete testimonial from ${t.authorName}? This cannot be undone.`)) return;
      try {
        await deleteTestimonial(t.id);
        toastManager.success('Testimonial deleted.');
        if (testimonialEditing?.id === t.id) closeTestimonialModal();
      } catch (err: unknown) {
        toastManager.error(err instanceof Error ? err.message : 'Failed to delete testimonial');
      }
    },
    [deleteTestimonial, testimonialEditing, closeTestimonialModal]
  );

  const columns: Column<AdminExternalReviewDTO>[] = [
    {
      id: 'provider',
      header: 'Provider',
      accessor: (row) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {row.providerDisplayName ?? row.provider ?? '—'}
        </span>
      ),
    },
    {
      id: 'author',
      header: 'Author',
      accessor: (row) => row.authorName || '—',
    },
    {
      id: 'rating',
      header: 'Rating',
      accessor: (row) => (row.rating != null ? `${row.rating} ★` : '—'),
      width: '6rem',
    },
    {
      id: 'content',
      header: 'Content',
      accessor: (row) => (
        <span className="text-slate-600 dark:text-slate-400" title={row.content ?? undefined}>
          {truncate(row.content, 80)}
        </span>
      ),
    },
    {
      id: 'visible',
      header: 'Visible',
      accessor: (row) => (
        <span
          className={
            row.isVisible
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 dark:text-slate-500'
          }
        >
          {row.isVisible ? 'Yes' : 'No'}
        </span>
      ),
      width: '6rem',
    },
    {
      id: 'publishedAt',
      header: 'Published',
      accessor: (row) => formatDate(row.publishedAt),
      width: '8rem',
    },
    {
      id: 'actions',
      header: '',
      accessor: () => null,
      width: '10rem',
      align: 'right',
      sortable: false,
    },
  ];

  const testimonialColumns: Column<AdminTestimonialDTO>[] = [
    { id: 'author', header: 'Author', accessor: (row) => row.authorName || '—' },
    {
      id: 'rating',
      header: 'Rating',
      accessor: (row) => (row.rating != null ? `${row.rating} ★` : '—'),
      width: '6rem',
    },
    {
      id: 'quote',
      header: 'Quote',
      accessor: (row) => (
        <span className="text-slate-600 dark:text-slate-400" title={row.quote}>
          {truncate(row.quote, 60)}
        </span>
      ),
    },
    {
      id: 'source',
      header: 'Source',
      accessor: (row) => row.sourceLabel ?? row.sourceType ?? '—',
      width: '8rem',
    },
    {
      id: 'published',
      header: 'Published',
      accessor: (row) => (row.published ? 'Yes' : 'No'),
      width: '6rem',
    },
    {
      id: 'actions',
      header: '',
      accessor: () => null,
      width: '10rem',
      align: 'right',
      sortable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={BREADCRUMBS} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage Google and Trustpilot review sources. Sync and show or hide reviews on the home page.
          </p>
        </div>
        <Link href={ROUTES.DASHBOARD_ADMIN}>
          <DashboardButton variant="bordered" size="sm">
            {BACK_TO_ADMIN_DASHBOARD_LABEL}
          </DashboardButton>
        </Link>
      </div>

      {/* Review sources */}
      <section className="rounded-card border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Review sources
          </h2>
          {!sourcesLoading && !sourcesError && sources.length > 0 && (
            <DashboardButton variant="primary" size="sm" onClick={openAddReviewSourceModal} aria-label="Add review source">
              <Plus className="h-4 w-4" aria-hidden />
              {EMPTY_STATE.NO_REVIEW_SOURCES_YET.actionLabel}
            </DashboardButton>
          )}
        </div>
        {sourcesLoading ? (
          <div className="h-24 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
        ) : sourcesError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{sourcesError}</p>
        ) : sources.length === 0 ? (
          <EmptyState
            title={EMPTY_STATE.NO_REVIEW_SOURCES_YET.title}
            message={EMPTY_STATE.NO_REVIEW_SOURCES_YET.message}
            action={
              <DashboardButton variant="primary" size="sm" onClick={openAddReviewSourceModal}>
                {EMPTY_STATE.NO_REVIEW_SOURCES_YET.actionLabel}
              </DashboardButton>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <ReviewSourceCard
                key={source.id}
                source={source}
                onSync={() => handleSync(source.id)}
                isSyncing={syncingId === source.id}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Curated testimonials (admin-added reviews) */}
      <section className="rounded-card border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Curated testimonials
          </h2>
          {!testimonialsLoading && !testimonialsError && testimonials.length > 0 && (
            <DashboardButton variant="primary" size="sm" onClick={openAddTestimonialModal} aria-label="Add review">
              <Plus className="h-4 w-4" aria-hidden />
              {EMPTY_STATE.NO_TESTIMONIALS_YET.actionLabel}
            </DashboardButton>
          )}
        </div>
        <div className="p-4">
          {testimonialsLoading ? (
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <tbody>
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={testimonialColumns.length} />
              </tbody>
            </table>
          ) : testimonialsError ? (
            <EmptyState
              title="Error loading testimonials"
              message={testimonialsError}
              action={
                <DashboardButton variant="primary" size="sm" onClick={() => void refetchTestimonials()}>
                  Retry
                </DashboardButton>
              }
            />
          ) : testimonials.length === 0 ? (
            <EmptyState
              title={EMPTY_STATE.NO_TESTIMONIALS_YET.title}
              message={EMPTY_STATE.NO_TESTIMONIALS_YET.message}
              action={
                <DashboardButton variant="primary" size="sm" onClick={openAddTestimonialModal}>
                  {EMPTY_STATE.NO_TESTIMONIALS_YET.actionLabel}
                </DashboardButton>
              }
            />
          ) : (
            <DataTable
              columns={testimonialColumns}
              data={testimonials}
              isLoading={false}
              searchable={false}
              getRowId={(row) => row.id}
              renderRowActions={(row) => (
                <RowActions>
                  <EditAction tooltip="Edit testimonial" onClick={() => openEditTestimonialModal(row)} />
                  <DeleteAction tooltip="Delete testimonial" onClick={() => handleDeleteTestimonial(row)} />
                </RowActions>
              )}
              totalCount={testimonialMeta?.total}
              currentPage={testimonialMeta?.currentPage ?? 1}
              onPageChange={setTestimonialPage}
            />
          )}
        </div>
      </section>

      {/* External reviews table */}
      <section className="rounded-card border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-400">
          External reviews
        </h2>
        <div className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search author or content..."
              className="min-w-[160px] max-w-[320px] flex-1"
            />
            <FilterTriggerButton
              ref={filterTriggerRef}
              onClick={() => setFilterPanelOpen(true)}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
            />
            <FilterPanel
              isOpen={filterPanelOpen}
              onClose={() => setFilterPanelOpen(false)}
              triggerRef={filterTriggerRef}
              title="Filters"
              onApply={handleApplyFilters}
              onResetAll={() => setStagedProvider('')}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
            >
              <FilterSection title="Provider" isActive={!!stagedProvider}>
                <FilterSelect
                  size="panel"
                  label=""
                  value={stagedProvider}
                  onChange={(v) => setStagedProvider(v)}
                  options={PROVIDER_OPTIONS}
                />
              </FilterSection>
            </FilterPanel>
          </div>

          {reviewsLoading ? (
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <tbody>
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={columns.length} />
              </tbody>
            </table>
          ) : reviewsError ? (
            <EmptyState
              title="Error loading reviews"
              message={reviewsError}
              action={
                <DashboardButton variant="primary" size="sm" onClick={() => void refetchReviews()}>
                  Retry
                </DashboardButton>
              }
            />
          ) : reviews.length === 0 ? (
            <EmptyState
              title={EMPTY_STATE.NO_EXTERNAL_REVIEWS_FOUND.title}
              message={EMPTY_STATE.NO_EXTERNAL_REVIEWS_FOUND.message}
            />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={reviews}
                isLoading={false}
                searchable={false}
                getRowId={(row) => row.id}
                renderRowActions={(row) => (
                  <RowActions>
                    <DashboardButton
                      variant="ghost"
                      size="sm"
                      aria-label={row.isVisible ? 'Hide from home page' : 'Show on home page'}
                      title={row.isVisible ? 'Hide from home page' : 'Show on home page'}
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleToggleVisible(row);
                      }}
                      disabled={togglingVisibilityId !== null}
                    >
                      {row.isVisible ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </DashboardButton>
                    <DashboardButton
                      variant="ghost"
                      size="sm"
                      aria-label="Promote to testimonial"
                      title={row.hasTestimonial ? 'Already promoted' : 'Promote to testimonial'}
                      onClick={(e) => {
                        e?.stopPropagation();
                        if (!row.hasTestimonial) handlePromote(row);
                      }}
                      disabled={row.hasTestimonial || promotingId !== null}
                    >
                      <MessageSquarePlus
                        className={`h-4 w-4 ${row.hasTestimonial ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}
                      />
                    </DashboardButton>
                  </RowActions>
                )}
                totalCount={meta?.total}
                currentPage={meta?.currentPage ?? 1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>

      <BaseModal
        isOpen={testimonialModalOpen}
        onClose={closeTestimonialModal}
        title={testimonialEditing ? 'Edit testimonial' : 'Add review'}
        footer={
          <div className="flex justify-end gap-2">
            <DashboardButton variant="bordered" size="sm" onClick={closeTestimonialModal} disabled={testimonialSubmitting}>
              Cancel
            </DashboardButton>
            <DashboardButton variant="primary" size="sm" onClick={handleTestimonialSubmit} disabled={testimonialSubmitting}>
              {testimonialSubmitting ? 'Saving…' : testimonialEditing ? 'Update' : 'Add'}
            </DashboardButton>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="testimonial-author" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Author name *
            </label>
            <input
              id="testimonial-author"
              type="text"
              value={testimonialForm.authorName}
              onChange={(e) => setTestimonialForm((prev) => ({ ...prev, authorName: e.target.value }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div>
            <label htmlFor="testimonial-role" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Author role (optional)
            </label>
            <input
              id="testimonial-role"
              type="text"
              value={testimonialForm.authorRole ?? ''}
              onChange={(e) => setTestimonialForm((prev) => ({ ...prev, authorRole: e.target.value || null }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. Parent"
            />
          </div>
          <div>
            <label htmlFor="testimonial-quote" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Quote *
            </label>
            <textarea
              id="testimonial-quote"
              rows={4}
              value={testimonialForm.quote}
              onChange={(e) => setTestimonialForm((prev) => ({ ...prev, quote: e.target.value }))}
              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="The review text..."
            />
          </div>
          <div>
            <label htmlFor="testimonial-rating" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Rating (optional, 1–5)
            </label>
            <select
              id="testimonial-rating"
              value={testimonialForm.rating ?? ''}
              onChange={(e) =>
                setTestimonialForm((prev) => ({
                  ...prev,
                  rating: e.target.value === '' ? null : parseInt(String(e.target.value), 10),
                }))
              }
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="testimonial-source-label" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Source label (optional)
            </label>
            <input
              id="testimonial-source-label"
              type="text"
              value={testimonialForm.sourceLabel ?? ''}
              onChange={(e) => setTestimonialForm((prev) => ({ ...prev, sourceLabel: e.target.value || null }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. Google, Trustpilot"
            />
          </div>
          <div>
            <label htmlFor="testimonial-source-url" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Source URL (optional)
            </label>
            <input
              id="testimonial-source-url"
              type="url"
              value={testimonialForm.sourceUrl ?? ''}
              onChange={(e) => setTestimonialForm((prev) => ({ ...prev, sourceUrl: e.target.value || null }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="https://..."
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={testimonialForm.published}
              onChange={(e) => setTestimonialForm((prev) => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Published (show on site)</span>
          </label>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={reviewSourceModalOpen}
        onClose={closeReviewSourceModal}
        title="Add review source"
        footer={
          <div className="flex justify-end gap-2">
            <DashboardButton variant="bordered" size="sm" onClick={closeReviewSourceModal} disabled={reviewSourceSubmitting}>
              Cancel
            </DashboardButton>
            <DashboardButton variant="primary" size="sm" onClick={handleReviewSourceSubmit} disabled={reviewSourceSubmitting}>
              {reviewSourceSubmitting ? 'Adding…' : 'Add source'}
            </DashboardButton>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="review-source-provider" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Provider *
            </label>
            <select
              id="review-source-provider"
              value={reviewSourceForm.provider}
              onChange={(e) =>
                setReviewSourceForm((prev) => ({ ...prev, provider: e.target.value as 'google' | 'trustpilot' | 'other' }))
              }
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="google">Google</option>
              <option value="trustpilot">Trustpilot</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="review-source-display-name" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Display name *
            </label>
            <input
              id="review-source-display-name"
              type="text"
              value={reviewSourceForm.displayName}
              onChange={(e) => setReviewSourceForm((prev) => ({ ...prev, displayName: e.target.value }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g. Google Business"
            />
          </div>
          <div>
            <label htmlFor="review-source-location-id" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Location / place ID (optional)
            </label>
            <input
              id="review-source-location-id"
              type="text"
              value={reviewSourceForm.locationId ?? ''}
              onChange={(e) => setReviewSourceForm((prev) => ({ ...prev, locationId: e.target.value || null }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Google place ID or Trustpilot business ID"
            />
          </div>
          <div>
            <label htmlFor="review-source-api-key" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              API key (optional)
            </label>
            <input
              id="review-source-api-key"
              type="password"
              autoComplete="off"
              value={reviewSourceForm.apiKey ?? ''}
              onChange={(e) => setReviewSourceForm((prev) => ({ ...prev, apiKey: e.target.value || null }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Required for sync"
            />
          </div>
          <div>
            <label htmlFor="review-source-api-secret" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              API secret (optional)
            </label>
            <input
              id="review-source-api-secret"
              type="password"
              autoComplete="off"
              value={reviewSourceForm.apiSecret ?? ''}
              onChange={(e) => setReviewSourceForm((prev) => ({ ...prev, apiSecret: e.target.value || null }))}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="If required by provider"
            />
          </div>
          <div>
            <label htmlFor="review-source-sync-frequency" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
              Sync frequency (minutes)
            </label>
            <input
              id="review-source-sync-frequency"
              type="number"
              min={60}
              max={10080}
              value={reviewSourceForm.syncFrequencyMinutes ?? 1440}
              onChange={(e) =>
                setReviewSourceForm((prev) => ({
                  ...prev,
                  syncFrequencyMinutes: parseInt(String(e.target.value), 10) || 1440,
                }))
              }
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">Min 60, max 10080 (e.g. 1440 = daily)</p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={reviewSourceForm.isActive ?? true}
              onChange={(e) => setReviewSourceForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Active (include in sync)</span>
          </label>
        </div>
      </BaseModal>
    </div>
  );
}

function ReviewSourceCard({
  source,
  onSync,
  isSyncing,
}: {
  source: AdminReviewSourceDTO;
  onSync: () => void;
  isSyncing: boolean;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-600 dark:bg-slate-700/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 shrink-0 text-star-gold" aria-hidden />
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {source.displayName}
          </span>
          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-2xs font-medium text-slate-600 dark:bg-slate-500 dark:text-slate-200">
            {source.provider}
          </span>
        </div>
        <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">
          {source.visibleReviewCount} visible · avg {source.averageRating ?? '—'} ★
          {source.lastSyncedAt ? ` · Synced ${formatDate(source.lastSyncedAt)}` : ' · Never synced'}
        </p>
      </div>
      <DashboardButton
        variant="bordered"
        size="sm"
        onClick={onSync}
        disabled={!source.isActive || isSyncing}
        aria-label="Sync reviews now"
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="h-4 w-4" aria-hidden />
        )}
      </DashboardButton>
    </li>
  );
}
