import React from "react";
import type { SortDirection } from "@/components/tables/data-table";

export interface UseTableOptions<TData> {
  initialSortKey?: keyof TData & string;
  initialSortDirection?: SortDirection;
  initialSearch?: string;
}

export interface UseTableResult<TData> {
  sortedData: TData[];
  sortKey: string | null;
  sortDirection: SortDirection;
  searchQuery: string;
  onSortChange: (columnId: string) => void;
  onSearchQueryChange: (value: string) => void;
}

export function useTable<TData extends Record<string, unknown>>(
  data: TData[],
  options?: UseTableOptions<TData>,
): UseTableResult<TData> {
  const [sortKey, setSortKey] = React.useState<string | null>(
    options?.initialSortKey ?? null,
  );
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(
    options?.initialSortDirection ?? null,
  );
  const [searchQuery, setSearchQuery] = React.useState(
    options?.initialSearch ?? "",
  );

  const onSortChange = (columnId: string) => {
    setSortKey((currentKey) => {
      if (currentKey !== columnId) {
        setSortDirection("asc");
        return columnId;
      }
      setSortDirection((currentDirection) => {
        if (currentDirection === "asc") return "desc";
        if (currentDirection === "desc") return null;
        return "asc";
      });
      return currentKey;
    });
  };

  const onSearchQueryChange = (value: string) => {
    setSearchQuery(value);
  };

  const sortedData = React.useMemo(() => {
    const normalisedSearch = searchQuery.trim().toLowerCase();
    let filtered = data;

    if (normalisedSearch) {
      filtered = data.filter((item) =>
        Object.values(item).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalisedSearch),
        ),
      );
    }

    if (!sortKey || !sortDirection) {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, searchQuery, sortDirection, sortKey]);

  return {
    sortedData,
    sortKey,
    sortDirection,
    searchQuery,
    onSortChange,
    onSearchQueryChange,
  };
}

