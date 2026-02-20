'use client';

import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { EmptyState } from './EmptyState';
import { ListRowsSkeleton, TableRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

/**
 * Generic data table with search, sort, pagination, empty state.
 * Universal dashboard template component – use for list/table pages.
 */

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<TData> {
  id: string;
  header: string;
  accessor: (row: TData) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'centre' | 'right';
}

export interface DataTableProps<TData> {
  title?: string;
  description?: string;
  columns: Column<TData>[];
  data: TData[];
  /** @deprecated Use isLoading. Kept for backward compatibility. */
  loading?: boolean;
  /** Preferred: loading state for the table. Takes precedence over loading. */
  isLoading?: boolean;
  /** Error message to show with a retry button; when set, table body is replaced by error UI. */
  error?: string | null;
  /** Called when user clicks retry after an error. */
  onRetry?: () => void;
  emptyMessage?: string;
  emptyTitle?: string;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  onAddClick?: () => void;
  addLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  sortable?: boolean;
  sortKey?: string | null;
  sortDirection?: SortDirection;
  /** Called with (key, direction). direction is null when column is unsorted. For paginated tables, parent should refetch with sort params. */
  onSortChange?: (columnId: string | null, direction: 'asc' | 'desc' | null) => void;
  renderFilters?: () => React.ReactNode;
  renderRowActions?: (row: TData) => React.ReactNode;
  /** When true, render as stacked cards on viewports &lt; md, table on md+. */
  responsive?: boolean;
  /** Server-side pagination: when set, data is the current page only, no slicing. Footer uses totalCount and onPageChange. */
  totalCount?: number;
  /** Current page (1-based). Required when totalCount is set. */
  currentPage?: number;
  /** Called when user clicks prev/next. Required when totalCount is set. */
  onPageChange?: (page: number) => void;
}

function alignClass(align?: 'left' | 'centre' | 'right'): string {
  switch (align) {
    case 'right':
      return 'text-right';
    case 'centre':
      return 'text-center';
    default:
      return 'text-left';
  }
}

export function DataTable<TData>({
  title,
  description,
  columns,
  data,
  loading: loadingProp = false,
  isLoading,
  error,
  onRetry,
  emptyMessage = EMPTY_STATE.NO_RESULTS.message,
  emptyTitle = EMPTY_STATE.NO_RESULTS.title,
  pageSize = 10,
  onRowClick,
  onAddClick,
  addLabel = 'Add new',
  searchable = true,
  searchPlaceholder = 'Search…',
  searchQuery,
  onSearchQueryChange,
  sortable = true,
  sortKey,
  sortDirection,
  onSortChange,
  renderFilters,
  renderRowActions,
  responsive = false,
  totalCount: totalCountProp,
  currentPage: currentPageProp,
  onPageChange,
}: DataTableProps<TData>) {
  const loading = isLoading ?? loadingProp;
  const [internalPage, setInternalPage] = React.useState(1);
  const hasError = Boolean(error);

  const isServerPagination = totalCountProp != null && currentPageProp != null && onPageChange;
  const total = isServerPagination ? totalCountProp! : data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = isServerPagination ? currentPageProp! : internalPage;
  const start = (page - 1) * pageSize;
  const end = isServerPagination ? start + data.length : start + pageSize;
  const pageItems = isServerPagination ? data : data.slice(start, end);

  const handleSortClick = (columnId: string, sortableColumn?: boolean) => {
    if (!sortableColumn || !sortable || !onSortChange) return;
    const nextKey =
      sortKey !== columnId
        ? columnId
        : sortDirection === 'asc'
          ? columnId
          : null;
    const nextDir: 'asc' | 'desc' | null =
      sortKey !== columnId
        ? 'asc'
        : sortDirection === 'asc'
          ? 'desc'
          : null;
    onSortChange(nextKey, nextDir);
  };

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {(title || description || onAddClick) && (
        <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            {title && (
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {onAddClick && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={onAddClick}
              className="mt-2 w-full md:mt-0 md:w-auto"
            >
              {addLabel}
            </Button>
          )}
        </header>
      )}

      {/* Search and filters live in FilterBar above DataTable — not in table toolbar. */}

      {/* Error state: inline message + retry (replaces table when error is set) */}
      {hasError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <p className="mb-2">{error}</p>
          {onRetry && (
            <Button type="button" size="sm" variant="bordered" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Responsive: card stack on small screens */}
      {responsive && !hasError && (
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="py-4" aria-busy="true" aria-label="Loading">
              <ListRowsSkeleton count={SKELETON_COUNTS.LIST_ROWS} />
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              message={emptyMessage}
              action={
                onAddClick ? (
                  <Button type="button" size="sm" variant="primary" onClick={onAddClick}>
                    {addLabel}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            pageItems.map((row, index) => {
              const key = `card-${start + index}`;
              return (
                <div
                  key={key}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  className={`rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''
                  }`}
                >
                  <dl className="grid grid-cols-1 gap-2">
                    {columns.map((col) => (
                      <div key={col.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                        <dt className="text-2xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {col.header}
                        </dt>
                        <dd className="min-w-0 text-slate-900 dark:text-slate-100">
                          {col.accessor(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {renderRowActions && (
                    <div
                      className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderRowActions(row)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table: hidden on small when responsive, always visible otherwise */}
      {!hasError && (
      <div className={responsive ? 'hidden md:block' : ''}>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="text-2xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {columns.map((column) => {
                const isSortable = Boolean(column.sortable && sortable);
                const isSorted = sortKey === column.id && sortDirection;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={`border-b border-slate-200 bg-slate-50 px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-900/60 ${alignClass(column.align)} ${isSortable ? 'select-none' : ''}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-1 hover:text-slate-900 dark:hover:text-slate-50"
                        onClick={() => handleSortClick(column.id, column.sortable)}
                        aria-sort={
                          isSorted
                            ? sortDirection === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : undefined
                        }
                        title={isSorted ? `Sorted ${sortDirection === 'asc' ? 'A–Z' : 'Z–A'}. Click to change.` : 'Click to sort'}
                      >
                        <span>{column.header}</span>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-slate-900 dark:text-slate-50" aria-hidden />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-slate-900 dark:text-slate-50" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-500" aria-hidden />
                        )}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
              {renderRowActions && (
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-2xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowsSkeleton
                rowCount={SKELETON_COUNTS.TABLE_ROWS}
                colCount={columns.length + (renderRowActions ? 1 : 0)}
              />
            ) : pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (renderRowActions ? 1 : 0)
                  }
                  className="p-0"
                >
                  <EmptyState
                    title={emptyTitle}
                    message={emptyMessage}
                    action={onAddClick ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={onAddClick}
                      >
                        {addLabel}
                      </Button>
                    ) : undefined}
                  />
                </td>
              </tr>
            ) : (
              pageItems.map((row, index) => {
                const key = `row-${start + index}`;
                const clickable = Boolean(onRowClick);
                return (
                  <tr
                    key={key}
                    className={`border-b border-slate-100 last:border-b-0 dark:border-slate-800 ${
                      clickable
                        ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900'
                        : ''
                    }`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-3 py-2 text-slate-700 dark:text-slate-100 ${alignClass(column.align)}`}
                      >
                        {column.accessor(row)}
                      </td>
                    ))}
                    {renderRowActions && (
                      <td
                        className="px-3 py-2 text-right align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderRowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
      )}

      {!hasError && !loading && total > 0 && (
        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-3 text-2xs text-slate-600 dark:border-slate-800 dark:text-slate-400 md:flex-row">
          <div>
            <span>
              Showing{' '}
              <span className="font-medium">
                {start + 1}-{start + pageItems.length}
              </span>{' '}
              of <span className="font-medium">{total}</span> items
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="xs"
              variant="bordered"
              disabled={page === 1}
              onClick={() => {
                const next = Math.max(1, page - 1);
                if (isServerPagination) onPageChange!(next);
                else setInternalPage(next);
              }}
              className="h-7 px-2"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="px-1">
              Page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </span>
            <Button
              type="button"
              size="xs"
              variant="bordered"
              disabled={page === totalPages}
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                if (isServerPagination) onPageChange!(next);
                else setInternalPage(next);
              }}
              className="h-7 px-2"
              aria-label="Next page"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </footer>
      )}
    </section>
  );
}
