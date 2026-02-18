"use client";

import React from "react";
import type { Column } from "@/components/tables/data-table";
import { InlineCellInput } from "./InlineCellInput";
import type { InlineCellInputType } from "./InlineCellInput";

export type InlineInputType = InlineCellInputType;

export interface InlineEditableColumn<TData> extends Column<TData> {
  editable?: boolean;
  inputType?: InlineInputType;
  options?: { value: string; label: string }[];
  field: keyof TData;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  booleanLabel?: string;
}

export interface InlineEditableTableProps<TData extends { id: string | number }> {
  columns: InlineEditableColumn<TData>[];
  data: TData[];
  onRowSave: (nextRow: TData) => Promise<void> | void;
  getRowKey?: (row: TData) => string | number;
  /** When true, click a cell to edit that cell only (no pencil column). When false, show pencil column for row edit. */
  clickCellToEdit?: boolean;
}

interface CellEditingState {
  rowKey: string | number;
  columnId: string;
  draftValue: unknown;
  saving: boolean;
}

export function InlineEditableTable<TData extends { id: string | number }>({
  columns,
  data,
  onRowSave,
  getRowKey,
  clickCellToEdit = true,
}: InlineEditableTableProps<TData>) {
  const [cellEdit, setCellEdit] = React.useState<CellEditingState | null>(null);
  const [rowEdit, setRowEdit] = React.useState<{
    rowKey: string | number;
    draft: Partial<TData>;
    saving: boolean;
  } | null>(null);

  const blurSaveScheduled = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cellEditRef = React.useRef<CellEditingState | null>(null);
  React.useEffect(() => {
    cellEditRef.current = cellEdit;
  }, [cellEdit]);

  const resolveRowKey = (row: TData) => (getRowKey ? getRowKey(row) : row.id);

  const cancelCellEdit = () => {
    if (blurSaveScheduled.current) {
      clearTimeout(blurSaveScheduled.current);
      blurSaveScheduled.current = null;
    }
    setCellEdit(null);
  };
  const cancelRowEdit = () => setRowEdit(null);

  type CellSnapshot = { rowKey: string | number; columnId: string; draftValue: unknown };
  const saveCellWithSnapshot = React.useCallback(
    async (snapshot: CellSnapshot) => {
      const row = data.find((r) => resolveRowKey(r) === snapshot.rowKey);
      const column = columns.find((c) => c.id === snapshot.columnId);
      if (!row || !column) {
        setCellEdit((prev) =>
          prev && prev.rowKey === snapshot.rowKey && prev.columnId === snapshot.columnId ? null : prev,
        );
        return;
      }
      const nextRow = { ...row, [column.field]: snapshot.draftValue } as TData;
      try {
        setCellEdit((prev) =>
          prev && prev.rowKey === snapshot.rowKey && prev.columnId === snapshot.columnId
            ? { ...prev, saving: true }
            : prev,
        );
        await onRowSave(nextRow);
        setCellEdit((prev) => {
          if (!prev) return null;
          if (prev.rowKey === snapshot.rowKey && prev.columnId === snapshot.columnId) return null;
          return prev;
        });
      } catch (e) {
        setCellEdit((prev) =>
          prev && prev.rowKey === snapshot.rowKey && prev.columnId === snapshot.columnId
            ? { ...prev, saving: false }
            : prev,
        );
        console.error(e);
      }
    },
    [data, columns, onRowSave],
  );

  const saveCurrentCell = React.useCallback(() => {
    if (blurSaveScheduled.current) {
      clearTimeout(blurSaveScheduled.current);
      blurSaveScheduled.current = null;
    }
    if (!cellEdit) return;
    saveCellWithSnapshot({
      rowKey: cellEdit.rowKey,
      columnId: cellEdit.columnId,
      draftValue: cellEdit.draftValue,
    });
  }, [cellEdit, saveCellWithSnapshot]);

  const handleCellBlur = React.useCallback(
    (rowKey: string | number, columnId: string) => {
      if (blurSaveScheduled.current) clearTimeout(blurSaveScheduled.current);
      blurSaveScheduled.current = setTimeout(() => {
        blurSaveScheduled.current = null;
        const current = cellEditRef.current;
        if (current && current.rowKey === rowKey && current.columnId === columnId) {
          saveCellWithSnapshot({ rowKey, columnId, draftValue: current.draftValue });
        }
      }, 150);
    },
    [saveCellWithSnapshot],
  );

  const handleCellClick = (row: TData, column: InlineEditableColumn<TData>) => {
    if (!column.editable) return;
    if (blurSaveScheduled.current) {
      clearTimeout(blurSaveScheduled.current);
      blurSaveScheduled.current = null;
    }
    setCellEdit((prev) => {
      if (prev && (prev.rowKey !== resolveRowKey(row) || prev.columnId !== column.id)) {
        saveCellWithSnapshot({ rowKey: prev.rowKey, columnId: prev.columnId, draftValue: prev.draftValue });
      }
      return {
        rowKey: resolveRowKey(row),
        columnId: column.id,
        draftValue: row[column.field],
        saving: false,
      };
    });
  };

  const handleCellValueChange = (value: unknown) => {
    setCellEdit((prev) => (prev ? { ...prev, draftValue: value } : null));
  };

  const saveRow = async () => {
    if (!rowEdit) return;
    const row = data.find((r) => resolveRowKey(r) === rowEdit.rowKey);
    if (!row) {
      setRowEdit(null);
      return;
    }
    const nextRow = { ...row, ...rowEdit.draft } as TData;
    try {
      setRowEdit((prev) => (prev ? { ...prev, saving: true } : null));
      await onRowSave(nextRow);
      setRowEdit(null);
    } catch (e) {
      setRowEdit((prev) => (prev ? { ...prev, saving: false } : null));
      console.error(e);
    }
  };

  const startRowEdit = (row: TData) => {
    setRowEdit({
      rowKey: resolveRowKey(row),
      draft: { ...row },
      saving: false,
    });
  };

  const handleRowFieldChange = <K extends keyof TData>(field: K, value: TData[K]) => {
    setRowEdit((prev) =>
      prev ? { ...prev, draft: { ...prev.draft, [field]: value } } : null,
    );
  };

  const isRowEdit = (rowKey: string | number) => rowEdit?.rowKey === rowKey;
  const isCellEdit = (rowKey: string | number, columnId: string) =>
    cellEdit?.rowKey === rowKey && cellEdit?.columnId === columnId;

  const renderCellInput = (
    column: InlineEditableColumn<TData>,
    value: unknown,
    options: {
      onSave: () => void;
      onBlurSave?: () => void;
      onCancel: () => void;
      saving: boolean;
      autoFocus?: boolean;
    },
  ) => (
    <InlineCellInput
      type={column.inputType ?? "text"}
      value={value as string | number | boolean}
      onChange={(v) => handleCellValueChange(v)}
      options={column.options}
      placeholder={column.placeholder}
      min={column.min}
      max={column.max}
      step={column.step}
      booleanLabel={column.booleanLabel}
      onEnter={options.onSave}
      onEscape={options.onCancel}
      onBlur={options.onBlurSave ?? options.onSave}
      disabled={options.saving}
      autoFocus={options.autoFocus}
    />
  );

  const renderRowEditInput = (column: InlineEditableColumn<TData>, value: unknown) => (
    <InlineCellInput
      type={column.inputType ?? "text"}
      value={value as string | number | boolean}
      onChange={(v) => handleRowFieldChange(column.field, v as TData[typeof column.field])}
      options={column.options}
      placeholder={column.placeholder}
      min={column.min}
      max={column.max}
      step={column.step}
      booleanLabel={column.booleanLabel}
      onEnter={saveRow}
      onEscape={cancelRowEdit}
      disabled={rowEdit?.saving}
    />
  );

  return (
    <table className="min-w-full border-separate border-spacing-0 text-caption">
      <thead>
        <tr className="text-micro uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {columns.map((col) => (
            <th
              key={col.id}
              scope="col"
              className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold dark:border-slate-700 dark:bg-slate-900/60"
            >
              {col.header}
            </th>
          ))}
          {!clickCellToEdit && (
            <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-right text-micro font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              Edit
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const rowKey = resolveRowKey(row);
          const rowEditing = isRowEdit(rowKey);

          return (
            <tr
              key={rowKey}
              className={`border-b border-slate-100 last:border-b-0 dark:border-slate-800 ${rowEditing ? "bg-sky-50 dark:bg-sky-900/30" : ""}`}
            >
              {columns.map((column) => {
                const cellEditing = clickCellToEdit && isCellEdit(rowKey, column.id);
                const displayValue = cellEditing
                  ? cellEdit!.draftValue
                  : rowEditing && rowEdit?.draft
                    ? (rowEdit.draft[column.field] as unknown)
                    : row[column.field];

                return (
                  <td
                    key={column.id}
                    className={`px-3 py-2 text-caption text-slate-700 dark:text-slate-100 ${column.editable && clickCellToEdit ? "cursor-text" : ""}`}
                    onClick={() => clickCellToEdit && column.editable && !cellEditing && !rowEditing && handleCellClick(row, column)}
                  >
                    {cellEditing && cellEdit && (
                      <div onClick={(e) => e.stopPropagation()}>
                        {renderCellInput(column, displayValue, {
                          onSave: saveCurrentCell,
                          onBlurSave: () => handleCellBlur(rowKey, column.id),
                          onCancel: cancelCellEdit,
                          saving: cellEdit.saving,
                          autoFocus: true,
                        })}
                      </div>
                    )}
                    {rowEditing && column.editable && !cellEditing && (
                      renderRowEditInput(column, displayValue)
                    )}
                    {!cellEditing && !(rowEditing && column.editable) && (
                      column.accessor(row)
                    )}
                  </td>
                );
              })}
              {!clickCellToEdit && (
                <td className="px-3 py-2 text-right align-middle">
                  {rowEditing ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        onClick={saveRow}
                        disabled={rowEdit?.saving}
                        aria-label="Save"
                      >
                        {rowEdit?.saving ? (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          "✓"
                        )}
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300"
                        onClick={cancelRowEdit}
                        disabled={rowEdit?.saving}
                        aria-label="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300"
                      onClick={() => startRowEdit(row)}
                      aria-label="Edit row"
                    >
                      ✎
                    </button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
