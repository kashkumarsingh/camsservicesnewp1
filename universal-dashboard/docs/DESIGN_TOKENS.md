# Design tokens – Universal Dashboard

Single source of truth for **font family**, **font size**, and **button/control sizes**. Change these in one place to rebrand or resize the app.

---

## Where they live

| Token type      | File              | Usage |
|-----------------|-------------------|--------|
| Font family     | `app/globals.css` | `--font-sans`, `--font-mono` |
| Type scale      | `app/globals.css` | `--text-display` … `--text-micro` |
| Tailwind theme  | `tailwind.config.ts` | `fontFamily`, `fontSize`, `spacing` (button/input heights) |
| Buttons         | `components/common/button.tsx` | `bySize` uses theme `text-caption` / `text-ui` and `h-button-sm-h` / `h-button-md-h` |

---

## Font family

- **Sans (default):** `--font-sans` in `globals.css`; Tailwind class `font-sans` (also set on `body`).
- **Mono:** `--font-mono`; use `font-mono` for code.

Change the stack in `:root` to rebrand (e.g. Inter, DM Sans).

---

## Font size (type scale)

Use these Tailwind classes so sizes stay consistent:

| Class        | Approx. | Use for |
|-------------|---------|---------|
| `text-display` | 24px | Page titles |
| `text-title`   | 20px | Section headings |
| `text-body`    | 14px | Body copy (default) |
| `text-ui`      | 13px | Buttons, inputs, nav labels |
| `text-caption` | 12px | Table cells, labels, captions |
| `text-micro`   | 11px | Badges, overlines, tight UI |

Values are defined in `globals.css` (`--text-*`) and wired in `tailwind.config.ts` under `theme.extend.fontSize`.

---

## Button size

- **Component:** `components/common/button.tsx`.
- **Sizes:** `sm` and `md` only; both use theme font size and height.

| Size | Height (theme)   | Font size (theme) |
|------|------------------|--------------------|
| `sm` | `h-button-sm-h` (1.75rem) | `text-caption` |
| `md` | `h-button-md-h` (2.25rem) | `text-ui` |

Use `<Button size="sm">` or `<Button size="md">`; avoid inline font/padding overrides so sizes stay shared.

---

## Input height

- **Theme:** `h-input-h` (2.25rem) in `tailwind.config.ts` under `spacing`.
- Prefer this class on inputs for a consistent control height with buttons.

---

## Summary

- **Font family and scale:** Centralised in `globals.css` and Tailwind theme; use `text-body`, `text-caption`, etc.
- **Button size:** Centralised in `Button` via theme (`bySize`); use `size="sm"` or `size="md"`.
- **Heights:** `h-button-sm-h`, `h-button-md-h`, `h-input-h` in theme for shared control sizes.

---

## Rollout status

The semantic type scale and dark palette have been rolled out across the universal-dashboard so that:

- **Typography:** Page titles use `text-display`; section headings use `text-title`; body and descriptions use `text-body`; labels, table cells, and captions use `text-caption`; badges and overlines use `text-micro`. Raw `text-xs` / `text-sm` / `text-[11px]` have been replaced in:
  - Tables: `DataTable`, `InlineEditableTable`, `TableFilters`, tables showcase page and side-panel content
  - Cards: `StatCard`, `EmptyState`, cards showcase page
  - Forms: `FormField`, `FormWrapper`, `FormError`, `Input`, `Select`, forms showcase page
  - Shell: `DashboardShell` (nav, notifications, user popover)
  - Modals, Sheet, Popover, Toast, Breadcrumbs
  - Calendar: `MiniCalendar`, `MainCalendar`, calendar showcase page
  - Auth: login, register, forgot-password pages
  - Landing: `app/page.tsx` (home)
  - Dashboard overview, popovers, modals showcase pages

- **Dark mode:** Tailwind `darkMode: "class"` is set; the shell toggles the `dark` class on the root. Tables, cards, sheets, modals, toasts, popovers, calendar components, form wrappers, inputs, and showcase page sections all use `dark:` variants for borders, backgrounds, and text so the dashboard looks consistent in dark mode.

- **Control heights:** Buttons use `h-button-sm-h` / `h-button-md-h`; inputs and selects use `h-input-h` (with filter controls using `h-button-sm-h` where appropriate).
