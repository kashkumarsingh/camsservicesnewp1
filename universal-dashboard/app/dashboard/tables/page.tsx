"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/tables/data-table";
import { InlineEditableTable } from "@/components/tables/inline-editable-table";
import { TableFilters } from "@/components/tables/table-filters";
import { useTable } from "@/hooks/useTable";
import { Button } from "@/components/common/button";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useToast } from "@/components/common/toast";
import { Switch } from "@/components/common/switch";
import { Sheet } from "@/components/sheet/Sheet";

interface MockItem {
  id: number;
  name: string;
  status: string;
  date: string;
  count: number;
}

const MOCK_ITEMS: MockItem[] = [
  { id: 1, name: "Item Alpha", status: "active", date: "2026-02-01", count: 42 },
  { id: 2, name: "Item Beta", status: "inactive", date: "2026-02-05", count: 18 },
  { id: 3, name: "Item Gamma", status: "active", date: "2026-02-08", count: 91 },
  { id: 4, name: "Item Delta", status: "pending", date: "2026-02-10", count: 7 },
];

interface ActivityItem {
  id: number;
  date: string;
  time: string;
  summary: string;
  detail: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    date: "Mon, 9 Feb 2026",
    time: "16:30",
    summary: "Count adjusted",
    detail: "Updated count from 7.0 to 8.0 (Admin)",
  },
  {
    id: 2,
    date: "Mon, 9 Feb 2026",
    time: "15:05",
    summary: "Status changed",
    detail: "Status set to Active by Kash Shay",
  },
  {
    id: 3,
    date: "Mon, 9 Feb 2026",
    time: "09:01",
    summary: "Row created",
    detail: "Item added via dashboard (web)",
  },
];

export default function TablesShowcasePage() {
  const { show } = useToast();
  const [filters, setFilters] = React.useState<Record<string, string>>({ status: "" });
  const [inlineData, setInlineData] = React.useState<MockItem[]>(MOCK_ITEMS);
  const [selectedRow, setSelectedRow] = React.useState<MockItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["showcase-items"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_ITEMS;
    },
  });

  const filtered = React.useMemo(() => {
    if (!data) return [];
    if (!filters.status) return data;
    return data.filter((row) => row.status === filters.status);
  }, [data, filters.status]);

  const {
    sortedData,
    sortKey,
    sortDirection,
    searchQuery,
    onSearchQueryChange,
    onSortChange,
  } = useTable<MockItem>(filtered, { initialSortKey: "date", initialSortDirection: "desc" });

  const columns = [
    { id: "name", header: "Name", accessor: (r: MockItem) => r.name, sortable: true },
    {
      id: "status",
      header: "Status",
      accessor: (r: MockItem) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
            r.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200" : r.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {r.status}
        </span>
      ),
      sortable: true,
    },
    { id: "date", header: "Date", accessor: (r: MockItem) => r.date, sortable: true },
    { id: "count", header: "Count", accessor: (r: MockItem) => r.count, sortable: true },
  ];

  const inlineColumns = [
    { id: "name", header: "Name", accessor: (r: MockItem) => r.name, editable: true, inputType: "text" as const, field: "name" as const, placeholder: "Name" },
    {
      id: "status",
      header: "Status",
      accessor: (r: MockItem) => r.status,
      editable: true,
      inputType: "select" as const,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
      field: "status" as const,
    },
    { id: "date", header: "Date", accessor: (r: MockItem) => r.date, editable: true, inputType: "date" as const, field: "date" as const },
    { id: "count", header: "Count", accessor: (r: MockItem) => r.count, editable: true, inputType: "number" as const, field: "count" as const, min: 0, max: 999 },
  ];

  const handleInlineSave = async (next: MockItem) => {
    await new Promise((r) => setTimeout(r, 400));
    setInlineData((prev) => prev.map((row) => (row.id === next.id ? next : row)));
    // No toast per cell — inline edits save silently to avoid spamming the admin.
  };

  const openRowSheet = (row: MockItem) => {
    setSelectedRow(row);
    setIsSheetOpen(true);
  };

  const closeRowSheet = () => {
    setIsSheetOpen(false);
    setSelectedRow(null);
  };

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Tables
        </h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Data table (sort, search, pagination, filters) and inline-editable table with mock data.
        </p>
      </header>

      {isLoading && <LoadingSkeleton lines={4} />}
      {!isLoading && (
        <>
          <DataTable<MockItem>
            title="Data table"
            description="Sortable, searchable, filterable. Click any row to open the side panel."
            columns={columns}
            data={sortedData}
            pageSize={5}
            sortable
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            searchable
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            onRowClick={openRowSheet}
            onAddClick={() => show({ title: "Add clicked", variant: "info" })}
            addLabel="Add item"
            renderFilters={() => (
              <TableFilters
                config={[
                  {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: [
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                      { label: "Pending", value: "pending" },
                    ],
                  },
                ]}
                values={filters}
                onChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                onClearAll={() => setFilters({ status: "" })}
              />
            )}
            renderRowActions={(row) => (
              <Button size="sm" variant="secondary" onClick={() => openRowSheet(row)}>
                View
              </Button>
            )}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-body shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-2 text-title font-semibold text-slate-900 dark:text-slate-50">
              Inline editable table
            </h2>
            <p className="mb-3 text-caption text-slate-600 dark:text-slate-400">
              Click the pencil to edit the row. Intelligent input per column. Save or Cancel in the row.
            </p>
            <div className="overflow-x-auto">
              <InlineEditableTable<MockItem> columns={inlineColumns} data={inlineData} onRowSave={handleInlineSave} clickCellToEdit={false} />
            </div>
          </div>

          <InlineIntelligentTableSection />

          {selectedRow && (
            <Sheet
              isOpen={isSheetOpen}
              onClose={closeRowSheet}
              title={selectedRow.name}
              side="right"
              size="md"
            >
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-micro text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    Side panel (not a modal)
                  </p>
                  <p>
                    Key details on the left; activity timeline on the right.
                    Table stays visible behind.
                  </p>
                </div>

                <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                  <div className="space-y-3">
                    <h3 className="text-micro font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Item details
                    </h3>
                    <dl className="space-y-2 text-body">
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Name
                        </dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-50">
                          {selectedRow.name}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Status
                        </dt>
                        <dd>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${
                              selectedRow.status === "active"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                                : selectedRow.status === "pending"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {selectedRow.status}
                          </span>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Date
                        </dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-50">
                          {selectedRow.date}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Count / hours
                        </dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-50">
                          {selectedRow.count}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-micro font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Activity log
                    </h3>
                    <ol className="relative max-h-56 overflow-y-auto pr-1 text-caption">
                      <div
                        className="absolute left-[7px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-700"
                        aria-hidden
                      />
                      {MOCK_ACTIVITY.map((item) => (
                        <li
                          key={item.id}
                          className="relative flex gap-3 pb-4 last:pb-0"
                        >
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                            <span className="h-2.5 w-2.5 rounded-full border-2 border-slate-300 bg-white ring-2 ring-white dark:border-slate-600 dark:bg-slate-900 dark:ring-slate-900" />
                          </div>
                          <div className="min-w-0 flex-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between text-micro text-slate-500 dark:text-slate-400">
                              <span>{item.date}</span>
                              <span>{item.time}</span>
                            </div>
                            <p className="mt-0.5 text-caption font-medium text-slate-900 dark:text-slate-50">
                              {item.summary}
                            </p>
                            <p className="text-caption text-slate-600 dark:text-slate-400">
                              {item.detail}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" onClick={closeRowSheet}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      show({ title: "Saved", variant: "success" });
                      closeRowSheet();
                    }}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </Sheet>
          )}
        </>
      )}
    </section>
  );
}

interface SmartRow {
  id: number;
  name: string;
  email: string;
  role: string;
  startTime: string;
  notes: string;
  active: boolean;
  score: number;
}

const MOCK_SMART: SmartRow[] = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "admin", startTime: "09:00", notes: "Lead", active: true, score: 85 },
  { id: 2, name: "Bob", email: "bob@example.com", role: "editor", startTime: "10:30", notes: "Content team", active: true, score: 72 },
  { id: 3, name: "Carol", email: "carol@example.com", role: "viewer", startTime: "14:00", notes: "", active: false, score: 60 },
];

function InlineIntelligentTableSection() {
  const [data, setData] = React.useState<SmartRow[]>(MOCK_SMART);

  const columns: import("@/components/tables/inline-editable-table").InlineEditableColumn<SmartRow>[] = [
    { id: "name", header: "Name", accessor: (r) => r.name, editable: true, inputType: "text", field: "name", placeholder: "Full name" },
    { id: "email", header: "Email", accessor: (r) => r.email, editable: true, inputType: "email", field: "email", placeholder: "you@example.com" },
    {
      id: "role",
      header: "Role",
      accessor: (r) => r.role,
      editable: true,
      inputType: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Viewer", value: "viewer" },
      ],
      field: "role",
    },
    { id: "startTime", header: "Start time", accessor: (r) => r.startTime, editable: true, inputType: "time", field: "startTime" },
    { id: "notes", header: "Notes", accessor: (r) => r.notes || "—", editable: true, inputType: "textarea", field: "notes", placeholder: "Optional notes" },
    { id: "active", header: "Active", accessor: (r) => <Switch checked={r.active} onChange={() => {}} disabled checkedLabel="Active" uncheckedLabel="Inactive" />, editable: true, inputType: "boolean", field: "active", booleanLabel: "Active" },
    { id: "score", header: "Score", accessor: (r) => r.score, editable: true, inputType: "number", field: "score", min: 0, max: 100 },
  ];

  const handleSave = async (next: SmartRow) => {
    await new Promise((r) => setTimeout(r, 300));
    setData((prev) => prev.map((row) => (row.id === next.id ? next : row)));
    // No toast per cell — inline cell saves are silent so the admin isn’t spammed.
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">Inline intelligent input table</h2>
      <p className="text-xs text-slate-600 mb-3">
        One more table: click the pencil to edit the row. Each column uses a different input (text, email, select, time, textarea, boolean, number). Save or Cancel in the row.
      </p>
      <div className="overflow-x-auto">
        <InlineEditableTable<SmartRow> columns={columns} data={data} onRowSave={handleSave} clickCellToEdit={false} />
      </div>
    </div>
  );
}
