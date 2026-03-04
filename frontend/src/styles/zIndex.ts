/**
 * Z-index design token scale.
 * Single source of truth for stacking order across the app.
 * Use Z.x in style/className (via Tailwind tokens) or inline style when needed (e.g. Floating UI).
 *
 * Stacking order:
 * - base (0): normal content
 * - raised (10): cards, dropdowns relative to content
 * - dropdown (100): select menus, autocomplete in forms
 * - sticky (200): sticky table headers, sticky sidebars, bottom nav bars
 * - header (300): top navigation / app header (fixed or sticky)
 * - overlay (500): modal/panel backdrop (dimmed overlay)
 * - sidePanel (600): SideCanvas drawer panel (above overlay)
 * - modal (700): modal dialogs, popovers, filter panel, notification dropdown, date picker
 * - popover (700): same as modal - tooltips, filter popovers, date pickers
 * - toast (800): toast notifications (always on top)
 * - critical (900): emergency overlays, loading screens
 */
export const Z = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  header: 300,
  overlay: 500,
  sidePanel: 600,
  modal: 700,
  popover: 700,
  toast: 800,
  critical: 900,
} as const;

export type ZIndexKey = keyof typeof Z;
