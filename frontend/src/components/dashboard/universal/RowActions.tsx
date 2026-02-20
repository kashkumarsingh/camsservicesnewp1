'use client';

import React from 'react';
import { Eye, Pencil, Trash2, CheckCircle, XCircle, Calendar } from 'lucide-react';

const ICON_SIZE = 14;
const BUTTON_SIZE = 'h-7 w-7';

export interface RowActionButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Tooltip and accessible label. */
  tooltip?: string;
  /** @deprecated Use tooltip. Kept for backward compatibility. */
  'aria-label'?: string;
  /** @deprecated Use tooltip. Kept for backward compatibility. */
  title?: string;
}

function useTooltip(props: RowActionButtonProps): string {
  const t = props.tooltip ?? props.title ?? props['aria-label'] ?? '';
  return t;
}

/**
 * Wrapper for table row action buttons. Right-aligned, consistent gap.
 */
export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {children}
    </div>
  );
}

/** Icon-only View action — slate. h-7 w-7, title + aria-label from tooltip. */
export function ViewAction(props: RowActionButtonProps) {
  const tooltip = useTooltip(props) || 'View details';
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      disabled={props.disabled}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick(e);
      }}
      className={`${BUTTON_SIZE} flex items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200`}
    >
      <Eye size={ICON_SIZE} aria-hidden />
    </button>
  );
}

/** Icon-only Edit action — slate. */
export function EditAction(props: RowActionButtonProps) {
  const tooltip = useTooltip(props) || 'Edit';
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      disabled={props.disabled}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick(e);
      }}
      className={`${BUTTON_SIZE} flex items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200`}
    >
      <Pencil size={ICON_SIZE} aria-hidden />
    </button>
  );
}

/** Icon-only Delete action — rose. */
export function DeleteAction(props: RowActionButtonProps) {
  const tooltip = useTooltip(props) || 'Delete';
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      disabled={props.disabled}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick(e);
      }}
      className={`${BUTTON_SIZE} flex items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300`}
    >
      <Trash2 size={ICON_SIZE} aria-hidden />
    </button>
  );
}

/** Icon-only Approve action — emerald. */
export function ApproveAction(props: RowActionButtonProps) {
  const tooltip = useTooltip(props) || 'Approve';
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      disabled={props.disabled}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick(e);
      }}
      className={`${BUTTON_SIZE} flex items-center justify-center rounded-md text-emerald-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300`}
    >
      <CheckCircle size={ICON_SIZE} aria-hidden />
    </button>
  );
}

/** Icon-only Reject action — rose. */
export function RejectAction(props: RowActionButtonProps) {
  const tooltip = useTooltip(props) || 'Reject';
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      disabled={props.disabled}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick(e);
      }}
      className={`${BUTTON_SIZE} flex items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300`}
    >
      <XCircle size={ICON_SIZE} aria-hidden />
    </button>
  );
}

/** Icon-only Availability action — indigo. */
export function AvailabilityAction(props: RowActionButtonProps) {
  const tooltip = useTooltip(props) || 'Manage availability';
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      disabled={props.disabled}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick(e);
      }}
      className={`${BUTTON_SIZE} flex items-center justify-center rounded-md text-indigo-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300`}
    >
      <Calendar size={ICON_SIZE} aria-hidden />
    </button>
  );
}
