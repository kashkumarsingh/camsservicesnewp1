/**
 * Universal dashboard template components.
 * Use these for consistent layout, tables, empty states and breadcrumbs
 * across parent, trainer and admin dashboard pages.
 */

export { Breadcrumbs, type Crumb } from './Breadcrumbs';
export { DataTable, type Column, type DataTableProps, type SortDirection } from './DataTable';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { FilterBar, type FilterBarProps } from './FilterBar';
export { FilterPanel, FilterTriggerButton, type FilterPanelProps, type FilterTriggerButtonProps } from './FilterPanel';
export { FilterSection, type FilterSectionProps } from './FilterSection';
export { FilterSelect, type FilterSelectProps, type FilterSelectOption } from './FilterSelect';
export { SearchInput, type SearchInputProps } from './SearchInput';
export {
  RowActions,
  ViewAction,
  EditAction,
  DeleteAction,
  ApproveAction,
  RejectAction,
  AvailabilityAction,
  type RowActionButtonProps,
} from './RowActions';
