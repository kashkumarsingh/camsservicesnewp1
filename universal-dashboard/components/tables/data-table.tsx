"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown, Search, Filter } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";

export type SortDirection = "asc" | "desc" | null;

export interface Column<TData> {
  id: string;
  header: string;
  accessor: (row: TData) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  align?: "left" | "centre" | "right";
}

export interface DataTableProps<TData> {
  title?: string;
  description?: string;
  columns: Column<TData>[];
  data: TData[];
  loading?: boolean;
  emptyMessage?: string;
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
  onSortChange?: (columnId: string) => void;
  renderFilters?: () => React.ReactNode;
  renderRowActions?: (row: TData) => React.ReactNode;
}

export function DataTable<TData>({
  title,
  description,
  columns,
  data,
  loading = false,
  emptyMessage = "No results found. Try adjusting your filters or create a new item.",
  pageSize = 10,
  onRowClick,
  onAddClick,
  addLabel = "Add new",
  searchable = true,
  searchPlaceholder = "Search by name…",
  searchQuery,
  onSearchQueryChange,
  sortable = true,
  sortKey,
  sortDirection,
  onSortChange,
  renderFilters,
  renderRowActions,
}: DataTableProps<TData>) {
  const [page, setPage] = React.useState(1);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = data.slice(start, end);

  const handleSortClick = (columnId: string, sortableColumn?: boolean) => {
    if (!sortableColumn || !sortable || !onSortChange) return;
    onSortChange(columnId);
  };

  const alignClass = (align?: "left" | "centre" | "right") => {
    switch (align) {
      case "right":
        return "text-right";
      case "centre":
        return "text-center";
      default:
        return "text-left";
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-caption shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {(title || description) && (
        <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            {title && (
              <h2 className="text-title font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-caption text-slate-600 dark:text-slate-400">
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

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {searchable && (
            <div className="flex min-w-0 flex-1 items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-ui text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <Search className="mr-1.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={searchQuery ?? ""}
                onChange={(event) =>
                  onSearchQueryChange?.(event.target.value)
                }
                placeholder={searchPlaceholder}
                className="h-5 w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          )}
          {renderFilters && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="inline-flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="text-caption">Filters</span>
            </Button>
          )}
        </div>
        {renderFilters && (
          <div className="flex flex-wrap items-center gap-2 text-caption text-slate-600 dark:text-slate-400">
            {renderFilters()}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-caption">
          <thead>
            <tr className="text-micro uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {columns.map((column) => {
                const isSorted = sortKey === column.id && sortDirection;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={`border-b border-slate-200 bg-slate-50 px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-900/60 ${alignClass(column.align)}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 ${column.sortable && sortable ? "cursor-pointer hover:text-slate-900 dark:hover:text-slate-50" : "cursor-default"}`}
                      onClick={() =>
                        handleSortClick(column.id, column.sortable)
                      }
                    >
                      <span>{column.header}</span>
                      {column.sortable && sortable && (
                        <ArrowUpDown
                          className={`h-3 w-3 ${
                            isSorted ? "text-slate-900 dark:text-slate-50" : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                      )}
                    </button>
                  </th>
                );
              })}
              {renderRowActions && (
                <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-micro font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="px-3 py-6 text-center text-caption text-slate-500 dark:text-slate-400"
                >
                  Loading…
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="px-3 py-8 text-center text-caption text-slate-500 dark:text-slate-400"
                >
                  <div className="space-y-1">
                    <div className="text-body font-medium text-slate-900 dark:text-slate-100">
                      No results found
                    </div>
                    <div className="text-caption text-slate-600 dark:text-slate-400">
                      {emptyMessage}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((row, index) => {
                const key = `row-${start + index}`;
                const clickable = Boolean(onRowClick);
                return (
                  <tr
                    key={key}
                    className={`border-b border-slate-100 last:border-b-0 dark:border-slate-800 ${clickable ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" : ""}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-3 py-2 text-caption text-slate-700 dark:text-slate-100 ${alignClass(column.align)}`}
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

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-3 text-micro text-slate-600 dark:border-slate-800 dark:text-slate-400 md:flex-row">
        <div>
          {total > 0 ? (
            <span>
              Showing{" "}
              <span className="font-medium">
                {start + 1}-{Math.min(end, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> items
            </span>
          ) : (
            <span>No items to display</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-micro">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="h-7 px-2"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="px-1">
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page === totalPages}
            onClick={() =>
              setPage((prev) => Math.min(totalPages, prev + 1))
            }
            className="h-7 px-2"
            aria-label="Next page"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </footer>
    </section>
  );
}

