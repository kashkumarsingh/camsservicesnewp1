## Universal Dashboard - Generic Implementation Guide

## Overview

A flexible, role-based dashboard system that can be adapted for any multi-user application. Includes authentication, multi-role support, and reusable dashboard components.

**Tech Stack:**
- Frontend: Next.js 16.1.6 + TypeScript (LTS latest) + Tailwind CSS (LTS latest) + shadcn/ui (latest LTS)
- Backend: Laravel 12.x + Sanctum
- State Management: React Query + Zustand
- Validation: Zod

---

## Dashboard Architecture

### Core Dashboard Features (All Roles)

**1. Authentication System**
- Login page (email + password)
- Register page
- Forgot password flow (3 steps)
- Role auto-detection from email domain
- Token-based auth (JWT/Sanctum)

**2. Navbar**
- Logo/App name
- Search bar (global search)
- User profile dropdown (avatar, name, role)
- Notifications icon (with count)
- Logout button
- Theme toggle (light/dark)
- Mobile menu hamburger

**3. Sidebar Navigation**
- Logo at top
- Collapsible menu items
- Active route highlighting
- Icons for each menu item
- Collapse/expand toggle
- Responsive (hamburger on mobile)

**4. Dashboard Layout Structure**
```
┌─────────────────────────────────────┐
│         NAVBAR                      │
├────────────┬───────────────────────┤
│            │                       │
│  SIDEBAR   │   MAIN CONTENT        │
│            │                       │
│            │   - Page title        │
│            │   - Breadcrumbs       │
│            │   - Filters/Actions   │
│            │   - Content area      │
│            │   - Pagination        │
│            │                       │
└────────────┴───────────────────────┘
```

---

## Page-Level Components

### 1. Overview/Dashboard Page

**Layout:**
- Welcome message with user's name
- Quick stats cards (4–6 cards showing KPIs)
- Charts section (optional)
- Recent activity/table preview
- Quick action buttons

**Stats Cards Should Show:**
- Large number (metric)
- Label (what it measures)
- Trend indicator (up/down arrow with %)
- Icon (visual representation)

**Example Stats Cards:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  📊 128     │  │  ✅ 45      │  │  ⏳ 12      │
│  Total      │  │  Completed  │  │  Pending    │
│  +5% ↑      │  │  +8% ↑      │  │  -2% ↓      │
└─────────────┘  └─────────────┘  └─────────────┘
```

### 2. Data Table Page

**Features:**
- Table with multiple columns
- Sortable headers (click to sort)
- Searchable (search box above table)
- Filterable (filter dropdown/buttons)
- Pagination (show X per page)
- Bulk actions (checkboxes, select all)
- Responsive (horizontal scroll on mobile)
- Empty state message
- Loading skeleton rows

**Table Actions:**
- View/Details button
- Edit button
- Delete button (with confirmation)
- More actions menu (if needed)

**Example Table:**
```
┌──────────────────────────────────────────────┐
│  Search box     [Filters ▼] [Add New ▼]     │
├──────────────────────────────────────────────┤
│ ☐  Name    Status    Date      Updated  Actions
├──────────────────────────────────────────────┤
│ ☐  Item 1  Active    2024-01-01  Today  [...]
│ ☐  Item 2  Inactive  2024-01-02  Today  [...]
│ ☐  Item 3  Active    2024-01-03  Today  [...]
├──────────────────────────────────────────────┤
│  Showing 1-3 of 15  [◄] [1] [2] [►]        │
└──────────────────────────────────────────────┘
```

### 3. Form/Create Page

**Layout:**
- Page title
- Form with fields
- Form sections (grouped fields)
- Validation error messages
- Required field indicators (*)
- Submit/Cancel buttons
- Optional: Draft save button

**Form Field Types:**
- Text input
- Email input
- Password input (with show/hide)
- Text area (multi-line)
- Select dropdown
- Multi-select (multiple options)
- Date picker
- Time picker
- File upload
- Toggle switch
- Radio buttons
- Checkboxes
- Number input

**Form Validation:**
- Real-time as user types
- Error message below field
- Red border on invalid field
- Disable submit if form invalid
- Server-side errors displayed

### 4. Detail/View Page

**Layout:**
- Page title
- Breadcrumb navigation
- Edit button
- Delete button
- Back button
- Info cards/sections
- Related data table
- Action buttons (context-specific)

---

## Inline Editing Tables

### Concept

User clicks any cell → cell becomes editable input → click outside or press Enter to save.

**Supported Input Types:**
- Text fields → text input
- Email → email input
- Numbers → number input
- Date → date picker
- Time → time picker
- Dropdown → select dropdown
- Boolean → toggle switch
- Long text → textarea (expands as modal)

**Behaviour:**
```
Normal State:
┌──────────┬──────────┬──────────┐
│ John     │ Active   │ Jan 1    │
└──────────┴──────────┴──────────┘

User clicks "John" cell:
┌──────────────────────┬──────────┬──────────┐
│ [John________] (✓ ✕) │ Active   │ Jan 1    │
└──────────────────────┴──────────┴──────────┘

User presses Enter/clicks outside:
Saves and returns to normal state
```

**Visual Feedback:**
- Blue highlight border while editing
- Save/Cancel icons appear
- Loading indicator while saving
- Toast notification on success
- Error message on failure
- Escape key cancels edit

---

## Modal/Dialog Components

### Types

**1. Confirmation Modal**
- Title
- Message
- Cancel button
- Confirm button (danger style for deletions)
- Optional checkbox ("Don't ask again")
- Centred overlay
- Prevent background scroll

**Visual Example:**
```
┌─────────────────────────────────────┐
│  Are you sure?                  [X] │
├─────────────────────────────────────┤
│  This action cannot be undone.      │
│                                     │
│  [Cancel]              [Delete]     │
└─────────────────────────────────────┘
```

**2. Form Modal**
- Title
- Form fields (organised in sections)
- Submit button
- Cancel button
- Close (X) button
- Error messages displayed inline
- Loading state (spinner on button)
- Scrollable content if tall
- Fixed footer with buttons

**Visual Example:**
```
┌─────────────────────────────────────┐
│  Create New Item                [X] │
├─────────────────────────────────────┤
│  [Name input field]                 │
│  [Email input field]                │
│  [Category dropdown]                │
│  [Description textarea]             │
│                                     │
│  [Cancel]              [Save]       │
└─────────────────────────────────────┘
```

**3. Info Modal**
- Title
- Content (text, lists, sections)
- Close button (X or OK)
- Optional action buttons
- Readable typography
- Scrollable if content tall

**Visual Example:**
```
┌─────────────────────────────────────┐
│  Details                        [X] │
├─────────────────────────────────────┤
│  Name: John Doe                     │
│  Email: john@example.com            │
│  Status: Active                     │
│  Created: Jan 1, 2024               │
│                                     │
│                            [Close]  │
└─────────────────────────────────────┘
```

**4. Large Content Modal**
- For displaying long content (terms, documentation)
- Scrollable body
- Header stays fixed
- Footer stays fixed
- Max height constraint

**Visual Example:**
```
┌─────────────────────────────────────┐
│  Terms of Service               [X] │
├─────────────────────────────────────┤
│ [Scrollable content area]           │
│  Lorem ipsum dolor sit amet...      │
│  ...                                │
│  ... (more content)                 │
│                                     │
│  [I Agree]              [Decline]   │
└─────────────────────────────────────┘
```

---

## Popover Components

### What is a Popover?

A small popup that appears near a trigger element (button, icon, etc.). Unlike modals, it does not have a backdrop and closes when clicking outside.

### Types

**1. Dropdown Popover**
- Appears below trigger
- List of options
- Closes on selection
- Closes on click outside
- Used for: menus, filters, actions

**Visual Example:**
```
[User Profile ▼]
  └─ Edit Profile
     Settings
     Logout
```

**2. Tooltip Popover**
- Small popup with text
- Appears on hover or focus
- Auto-dismisses after delay
- Used for: help text, hints, keyboard shortcuts

**Visual Example:**
```
[?] (hover)
  └─ This field is required
```

**3. Filter Popover**
- Shows filter options
- Multiple selections possible
- Apply/Clear buttons
- Closes on apply

**Visual Example:**
```
[Status ▼]
  ├─ ☐ Active
  ├─ ☐ Inactive
  ├─ ☐ Pending
  └─ [Apply] [Clear]
```

**4. Date Range Popover**
- Calendar picker
- Select start & end date
- Apply button
- Clear button

**Visual Example:**
```
[Date Range ▼]
  ├─ [Cal] [Cal]
  ├─ Selected: Jan 1 - Jan 31
  └─ [Apply] [Clear]
```

**5. User Menu Popover**
- Profile picture/icon
- User name
- Role/status
- Menu items (Settings, Logout, etc.)
- Often with avatar

**Visual Example:**
```
[👤 John ▼]
  ├─ 📋 Profile
  ├─ ⚙️ Settings
  ├─ 🔔 Preferences
  ├─ ───────
  └─ 🚪 Logout
```

**6. Action Menu Popover**
- Three dots menu (⋯)
- Context-specific actions
- Edit, Delete, Share, etc.
- Closes on selection

**Visual Example:**
```
[⋯]
  ├─ ✏️ Edit
  ├─ 📋 Duplicate
  ├─ 🔗 Share
  ├─ ───────
  └─ 🗑️ Delete
```

**7. Notification Popover**
- Bell icon
- Notification list
- Mark as read
- Clear all
- Link to notification centre

**Visual Example:**
```
[🔔 3]
  ├─ New booking confirmed
  ├─ Task assigned to you
  ├─ Comment on your post
  ├─ ───────
  └─ View all notifications
```

**8. Info Popover**
- Small info bubble
- Rich content (icons, text, links)
- Appears on hover/click
- Can stay open while interacting

**Visual Example:**
```
[Help Icon ℹ️]
  └─ Maximum 100 characters.
     Contact support for details.
```

---

## Modal vs Popover Differences

| Feature | Modal | Popover |
|---------|-------|---------|
| Backdrop | Has dark overlay | No overlay |
| Click outside | Close | Close |
| Position | Centred | Anchored to element |
| Size | Large, flexible | Small to medium |
| Keyboard | Escape closes | Escape closes |
| Use Case | Important actions, forms | Quick actions, menus |
| Stacking | One at a time | Multiple possible |

---

## Sheet/Drawer Components

### What is a Sheet?

A full or half-height panel that slides in from side (mobile) or expands (desktop). Alternative to modals for mobile UX.

### Types

**1. Side Sheet**
- Slides from right (or left)
- Width: 300–400px (mobile) or 400–600px (desktop)
- Full height
- Can be dismissible

**Visual Example (Mobile):**
```
┌───────────────────┐
│ Main Content [>]  │──┐
└───────────────────┘  │
                       │ [Sheet]
                       │ [Title]
                       │ [Content]
                       │ [Actions]
                       │
                       └────
```

**2. Bottom Sheet**
- Slides from bottom
- Full width
- Partial height (50–75% of screen)
- Drag handle at top
- Common on mobile

**Visual Example (Mobile):**
```
┌─────────────────────┐
│ Main Content        │
│                     │
├─────────────────────┤
│ ≡ (Drag handle)     │
│ [Sheet Title]       │
│ [Content]           │
│ [Actions]           │
└─────────────────────┘
```

**3. Full Screen Sheet**
- Like modal but slides in from side
- Full screen (100% width & height)
- Better for mobile experiences

---

## Popover Positioning

Popovers should appear smartly positioned:

**Auto-positioning Logic:**
- If space below: place below
- If no space: place above
- If space to right: align right
- If no space: align left
- Avoid going off-screen
- Small arrow/triangle pointing to trigger

**Visual Example:**
```
Top placement with arrow:
  ┌─────────────┐
  │ Popover     │
  │ Content     │
  └──────┬──────┘
         ▼ (arrow points to trigger)
       [Trigger Button]

Bottom placement with arrow:
       [Trigger Button]
         ▲ (arrow points to trigger)
  ┌──────┴──────┐
  │ Popover     │
  │ Content     │
  └─────────────┘
```

---

## Animation & Transitions

### Modal Animations
- Fade in (opacity 0→1)
- Scale (transform: scale 0.95→1)
- Duration: 200–300ms
- Easing: ease-out

### Popover Animations
- Fade in + scale
- Duration: 150–200ms
- Faster than modals
- Easing: ease-out

### Sheet Animations
- Slide in from side (translateX)
- Duration: 300–400ms
- Easing: ease-out

---

## Interaction Patterns

### Modal Interactions

**Closing Modal:**
- Click X button
- Click Cancel/Close button
- Press Escape key
- Click outside (optional, can disable)

**Form Modal Special:**
- Unsaved changes warning
- Disable submit while loading
- Auto-focus first input
- Tab through fields in order

### Popover Interactions

**Closing Popover:**
- Click outside (auto-close)
- Press Escape key
- Click item (if action menu)
- Click close button (optional)

**Staying Open:**
- Can interact with content (checkboxes, inputs)
- Use "Apply" button to confirm
- Dismiss on action or manually

---

## Focus Management

### Modal Focus

**When opening:**
- Focus first focusable element
- Usually first form field or close button
- Trap focus (Tab stays within modal)

**When closing:**
- Return focus to trigger element
- Allow subsequent Tab to continue naturally

### Popover Focus

**When opening:**
- Focus first item in popover
- Optional (can keep focus on trigger)

**When closing:**
- Return focus to trigger
- Or close without moving focus

---

## Accessibility for Modals & Popovers

**Required:**
- ARIA role (dialog, alertdialog, menu, listbox, etc.)
- aria-label or aria-labelledby
- aria-modal="true" for modals
- Keyboard navigation (Escape, Tab, Enter)
- Focus management
- Screen reader announcements

**Example:**
```html
<div role="dialog" 
     aria-modal="true" 
     aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm Delete</h2>
  ...
</div>
```

---

## Component Implementation

### Reusable Modal Component

```typescript
// Props
{
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
  loading?: boolean
}
```

### Reusable Popover Component

```typescript
// Props
{
  trigger: ReactNode
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  onOpenChange?: (open: boolean) => void
  closeDelay?: number
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
}
```

### Sheet Component

```typescript
// Props
{
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  side?: 'left' | 'right' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'full'
  isDismissible?: boolean
}
```

---

## Usage Examples

### Form Modal
```
User clicks "Add Item"
  ↓
Form Modal opens (auto-focus first field)
  ↓
User fills form
  ↓
User clicks Save
  ↓
Loading state (disabled button, spinner)
  ↓
On success: Modal closes, toast shows
On error: Error message shows in modal
```

### Action Popover Menu
```
User clicks three dots (⋯)
  ↓
Popover menu appears
  ↓
User clicks "Delete"
  ↓
Popover closes
  ↓
Confirmation modal opens
  ↓
User confirms deletion
```

### Filter Popover
```
User clicks Filter button
  ↓
Filter popover opens
  ↓
User selects options (checkboxes)
  ↓
User clicks Apply
  ↓
Popover closes, table updates
```

---

## Navigation Patterns

### Role-Based Navigation

Define which menu items appear for each role:

```
Admin Role:
- Dashboard
- Users
- Settings
- Reports
- System Configuration

Moderator Role:
- Dashboard
- Content Management
- Users (limited)
- Reports

User Role:
- Dashboard
- My Profile
- Settings
```

### Menu Item Structure

```
Primary Menu
├── Dashboard (icon + label)
├── Content (icon + label)
│   ├── Sub-item 1
│   ├── Sub-item 2
│   └── Sub-item 3
├── Management (icon + label)
└── Settings (icon + label)
```

---

## Common UI Patterns

### Search

**Single Search Box:**
- Appears above lists/tables
- Real-time filtering (search as you type)
- Clear button (X icon)
- Placeholder text ("Search by name...")

### Filters

**Filter Options:**
- Dropdown filters (Status, Category, etc.)
- Date range picker
- Multi-select filters
- Applied filters as badges/chips
- "Clear all filters" button
- Save filter presets

**Example:**
```
[Status ▼]  [Date ▼]  [Category ▼]
✓ Active    ✓ Inactive    [Clear all]
```

### Sorting

**Column Header Sorting:**
- Click column header to sort
- Icons show sort direction (↑ ↓)
- Support multi-column sort (shift+click)

### Pagination

**Options:**
- Page numbers (1 2 3 4 5)
- Previous/Next buttons
- Jump to page input
- Rows per page selector (25, 50, 100)
- Info: "Showing 1-25 of 156 items"

### Empty States

**Show when no data:**
- Icon (magnifying glass, inbox, etc.)
- Heading ("No results found")
- Message ("Try adjusting your filters")
- Action button ("Create new" or "Reset filters")

### Loading States

**Show while loading:**
- Skeleton loaders (grey placeholder shapes)
- Shimmer animation
- Loading spinner in centre
- "Loading..." text

### Error States

**Show on error:**
- Error icon
- Error message (user-friendly)
- Retry button
- Back button

---

## Form Patterns

### Field Layout

**Single Column:**
```
[Label]
[Input field]
[Error message if any]
[Helper text]
```

**Two Column:**
```
[Label 1]           [Label 2]
[Input field 1]     [Input field 2]
[Error if any]      [Error if any]
```

### Field Validation

**Required fields:** Red asterisk (*)
**Valid input:** Green checkmark
**Invalid input:** Red border + error message
**Disabled state:** Grey colour

### Form Sections

```
[Section Title]
┌────────────────────────┐
│ [Field 1]              │
│ [Field 2]              │
└────────────────────────┘

[Another Section Title]
┌────────────────────────┐
│ [Field 3]              │
│ [Field 4]              │
└────────────────────────┘

[Submit] [Cancel]
```

---

## Notifications & Feedback

### Toast Notifications

**Types:**
- Success (green): "Item saved successfully"
- Error (red): "Failed to save item"
- Warning (yellow): "Are you sure?"
- Info (blue): "New updates available"

**Behaviour:**
- Auto-dismiss after 4–5 seconds
- Position: top-right corner
- Max 3 notifications visible
- Close button (X)

**Toast Example:**
```
┌─────────────────────────────┐
│ ✓ Success                   │ X
│ Item saved successfully     │
└─────────────────────────────┘
```

### Inline Messages

- Success message after form submit
- Error message on validation fail
- Helper text below fields
- Confirmation messages

---

## Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px–1024px
- Desktop: > 1024px

### Mobile Adaptations

- Hamburger menu instead of sidebar
- Single column layout
- Horizontal scroll for tables
- Stacked form fields
- Larger touch targets (buttons)
- Bottom sheet modals instead of centred

---

## Accessibility

**Required:**
- ARIA labels for buttons
- Semantic HTML (buttons, inputs, etc.)
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators (visible)
- Colour contrast (WCAG AA)
- Alt text for images
- Skip navigation link

**Good Practice:**
- Screen reader friendly
- Logical tab order
- Error messages linked to fields
- Labels associated with inputs

---

## Implementation Structure

### Next.js File Organisation

```
app/
├── (public)/
│   ├── layout.tsx
│   └── page.tsx (landing page)
│
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
│
├── (dashboard)/
│   ├── layout.tsx (navbar + sidebar)
│   ├── page.tsx (overview)
│   ├── [role]/
│   │   ├── layout.tsx (role-specific)
│   │   ├── page.tsx
│   │   ├── resource-list/page.tsx
│   │   ├── resource-list/[id]/page.tsx
│   │   └── settings/page.tsx
│   └── shared/ (shared dashboard pages)
│
└── api/
    ├── auth/
    ├── resources/
    └── users/
```

### Component Organisation

```
components/
├── (dashboard)/
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   └── role-nav.tsx
│
├── (tables)/
│   ├── data-table.tsx
│   ├── inline-editable-table.tsx
│   └── table-filters.tsx
│
├── (forms)/
│   ├── form-wrapper.tsx
│   ├── form-field.tsx
│   └── form-error.tsx
│
├── (modals)/
│   ├── modal.tsx
│   ├── form-modal.tsx
│   ├── confirm-modal.tsx
│   └── info-modal.tsx
│
├── (cards)/
│   ├── stat-card.tsx
│   ├── info-card.tsx
│   └── empty-state.tsx
│
└── common/
    ├── button.tsx
    ├── input.tsx
    ├── select.tsx
    ├── toast.tsx
    ├── loading-skeleton.tsx
    └── breadcrumbs.tsx
```

### Hooks Organisation

```
hooks/
├── useAuth.ts
├── useNotification.ts
├── useFilters.ts
├── usePagination.ts
├── useTable.ts
└── useForm.ts
```

---

## Universal Features (All Dashboards)

### 1. User Profile Management
- View/Edit personal info
- Change password
- Profile picture upload
- Preferences/Settings

### 2. Authentication
- Login (email/password)
- Register
- Forgot password (3-step flow)
- Logout
- Role detection

### 3. Role-Based Access Control
- Different navigation per role
- Protected routes
- Feature visibility based on role
- API permission checks

### 4. Notifications
- Toast messages (success, error, warning)
- Notification bell (optional)
- Email/SMS notifications (optional)

### 5. Search & Filter
- Global search
- Page-level filters
- Saved filters (optional)
- Search history (optional)

### 6. Data Management
- Create (forms)
- Read (tables, details)
- Update (inline, forms)
- Delete (with confirmation)

### 7. Settings
- General settings
- User preferences
- Theme (light/dark)
- Language (optional)

---

## Data Flow Example

### Create/Edit Flow

```
User clicks "Add New"
    ↓
Modal/Form opens
    ↓
User fills fields
    ↓
Form validates (client-side)
    ↓
User clicks Submit
    ↓
API call to backend
    ↓
Backend validates & saves
    ↓
Return success/error
    ↓
Show toast notification
    ↓
Refresh data (React Query)
    ↓
Modal closes
```

### Delete Flow

```
User clicks Delete button
    ↓
Confirmation modal appears
    ↓
User confirms
    ↓
API call to backend
    ↓
Backend deletes
    ↓
Show success toast
    ↓
Refresh data
    ↓
Modal closes
```

---

## Development Phases

### Phase 1: Scaffolding & Auth
- Create file structure
- Authentication system
- Login/Register/Forgot password
- Middleware & route protection

### Phase 2: Dashboard Infrastructure
- Navbar & Sidebar
- Dashboard layout
- Navigation structure
- Role-based routing

### Phase 3: Common Components
- Tables (basic & inline editable)
- Forms
- Modals
- Cards & stats

### Phase 4: Pages & Features
- Create all pages
- Implement CRUD operations
- Add filters & search
- Add notifications

### Phase 5: API Integration
- Connect to Laravel backend
- Replace mock data
- Error handling
- Loading states

### Phase 6: Polish & Testing
- Unit tests
- E2E tests
- Performance optimisation
- Mobile responsiveness

---

## Implementation Checklist

**Auth System:**
- [ ] Login page
- [ ] Register page
- [ ] Forgot password (3 steps)
- [ ] Auth context
- [ ] Middleware protection
- [ ] Role detection

**Dashboard Infrastructure:**
- [ ] Navbar component
- [ ] Sidebar component
- [ ] Dashboard layout
- [ ] Responsive design
- [ ] Theme toggle

**Reusable Components:**
- [ ] Data table
- [ ] Inline editable table
- [ ] Forms
- [ ] Modals
- [ ] Cards
- [ ] Notifications
- [ ] Loading states

**Features:**
- [ ] CRUD operations
- [ ] Search & filter
- [ ] Pagination
- [ ] Sorting
- [ ] Bulk actions
- [ ] User settings
- [ ] Role-based access

---

## Key Principles

1. **Simplicity First** – Start simple, add complexity when needed.
2. **Consistency** – Same UI patterns everywhere.
3. **Responsive** – Works on all devices.
4. **Accessible** – WCAG AA compliant.
5. **Fast** – Quick load times & interactions.
6. **Intuitive** – Users understand without documentation.
7. **Flexible** – Easy to customise for different use cases.
8. **Reusable** – Components work in multiple contexts.

---

## Next Steps with Cursor

Use this prompt (adapted for this repo) when you are ready to scaffold:

```
"Create a universal dashboard scaffolding with:

AUTHENTICATION:
- Login, register, forgot password pages
- Email-based role detection
- Auth context & middleware

DASHBOARD LAYOUT:
- Navbar with user profile, search, notifications
- Sidebar with role-based navigation
- Responsive design (mobile hamburger menu)

CORE COMPONENTS:
- Data tables (sortable, filterable, searchable)
- Inline editable tables
- Forms with validation
- Modals (confirm, form, info)
- Stats cards with trends
- Empty states
- Loading skeletons
- Toast notifications

PAGES:
- Dashboard overview (stats, charts, recent activity)
- Resource list (table with CRUD)
- Resource detail view
- Create/Edit form
- User settings

Use Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, React Query, Zustand, and Zod.
Make it flexible enough to adapt for any multi-role application."
```

This defines a generic, universal dashboard that can be reused across applications in this monorepo.

