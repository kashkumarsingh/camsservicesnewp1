# BaseModal Component

**Universal, Reusable Modal Component**

Clean Architecture: Infrastructure/Presentation Layer (UI Component)

## Z-Index

Modals and overlay panels use the Tailwind z-index scale from `tailwind.config.js`:

- **z-mobileNav** (30): Mobile sidebar and bottom nav (below header)
- **z-sticky** (40): Sticky headers, nav
- **z-dropdown** (50): Dropdowns, popovers
- **z-overlay** (1000): Modals, side panels, full overlays (BaseModal, SideCanvas, etc.)
- **z-toast** (9999): Toasts

Use `z-overlay` for any new modal or overlay. **Modals and side panels must render via `createPortal(..., document.body)`** so they sit above the dashboard header; otherwise they can appear behind it due to stacking context.

## Overview

`BaseModal` is a universal modal component that provides all common modal functionality:
- Intelligent positioning (click-based or centered)
- Viewport detection (prevents off-screen positioning)
- Mobile-first (full-screen on mobile, responsive on desktop)
- Focus trap (keyboard navigation)
- Body scroll lock (prevents background scrolling)
- ESC key support
- Click-outside-to-close
- Smooth animations
- ARIA attributes for accessibility

## Usage Examples

### 1. Simple Modal with Title

```tsx
import { BaseModal } from '@/components/ui/Modal';

<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="My Modal"
>
  <p>Modal content here</p>
</BaseModal>
```

### 2. Modal with Custom Header/Footer (RECOMMENDED PATTERN)

**⚠️ IMPORTANT: Always use `footer` prop for action buttons - they will be automatically sticky at bottom!**

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  header={
    <div className="flex items-center gap-2">
      <Icon />
      <h2>Custom Header</h2>
    </div>
  }
  footer={
    <div className="flex gap-3">
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSave}>Save</Button>
    </div>
  }
>
  <p>Modal content here (scrollable)</p>
  <p>More content...</p>
  <p>Footer buttons stay visible at bottom!</p>
</BaseModal>
```

**Key Points:**
- ✅ Footer buttons are **ALWAYS sticky** at bottom (automatically handled by BaseModal)
- ✅ Content area is scrollable, footer stays visible
- ✅ Use `footer` prop for Cancel/Save/Submit buttons
- ✅ Footer has proper styling (border, shadow, background)

### 3. Modal with Click Position (Intelligent Positioning)

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Positioned Modal"
  clickPosition={{ x: 500, y: 300 }}
>
  <p>Modal positioned near click</p>
</BaseModal>
```

### 4. Modal without Header

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  showHeader={false}
>
  <p>Full custom content</p>
</BaseModal>
```

### 5. Different Sizes

```tsx
// Small modal
<BaseModal isOpen={isOpen} onClose={onClose} size="sm" title="Small">
  <p>Small content</p>
</BaseModal>

// Medium modal (default)
<BaseModal isOpen={isOpen} onClose={onClose} size="md" title="Medium">
  <p>Medium content</p>
</BaseModal>

// Large modal
<BaseModal isOpen={isOpen} onClose={onClose} size="lg" title="Large">
  <p>Large content</p>
</BaseModal>

// Extra large modal
<BaseModal isOpen={isOpen} onClose={onClose} size="xl" title="Extra Large">
  <p>Extra large content</p>
</BaseModal>

// Full width modal
<BaseModal isOpen={isOpen} onClose={onClose} size="full" title="Full Width">
  <p>Full width content</p>
</BaseModal>
```

### 6. Prevent Backdrop Close

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Important Modal"
  preventBackdropClose={true}
>
  <p>User must click button to close</p>
</BaseModal>
```

## Real-World Examples

### Parent Booking Modal (CORRECT PATTERN)

```tsx
// frontend/src/components/dashboard/modals/ParentBookingModal.tsx
import { BaseModal } from '@/components/ui/Modal';
import { useRef } from 'react';

export default function ParentBookingModal({ isOpen, onClose, ... }) {
  const formRef = useRef<HTMLFormElement>(null);
  
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Session' : 'Book Session'}
      clickPosition={clickPosition}
      size="md"
      footer={
        <div className="flex gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => formRef.current?.requestSubmit()}>
            Book Session
          </Button>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Booking form fields - scrollable */}
        <div className="space-y-4">
          {/* Date, Child, Time, Activity selection */}
        </div>
      </form>
    </BaseModal>
  );
}
```

**✅ CORRECT:** Buttons in `footer` prop - automatically sticky!
**❌ WRONG:** Buttons inside form content - will scroll away!

### Trainer Activity Modal

```tsx
// Example: Trainer Activity Override Modal
import { BaseModal } from '@/components/ui/Modal';

export default function TrainerActivityModal({ isOpen, onClose, schedule, onSuccess }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Override Activity"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Activity</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p>Select new activity for this session:</p>
        {/* Activity selection UI */}
      </div>
    </BaseModal>
  );
}
```

### Confirmation Modal

```tsx
// Example: Simple confirmation modal
import { BaseModal } from '@/components/ui/Modal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Action"
      size="sm"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Confirm</Button>
        </div>
      }
    >
      <p>{message}</p>
    </BaseModal>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | Required | Whether the modal is open |
| `onClose` | `() => void` | Required | Callback when modal should close |
| `title` | `string` | Optional | Modal title (rendered in header) |
| `header` | `ReactNode` | Optional | Custom header component (overrides title) |
| `footer` | `ReactNode` | Optional | Custom footer component |
| `children` | `ReactNode` | Required | Modal content |
| `clickPosition` | `{ x: number; y: number }` | Optional | Click position for intelligent positioning |
| `showHeader` | `boolean` | `true` | Show default header |
| `showCloseButton` | `boolean` | `true` | Show close button in header |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal size variant |
| `contentClassName` | `string` | `''` | Custom className for modal content |
| `preventBackdropClose` | `boolean` | `false` | Prevent closing on backdrop click |
| `ariaLabel` | `string` | Optional | Custom aria-label for modal |
| `ariaLabelledBy` | `string` | Optional | Custom aria-labelledby for modal |

## Features

### ✅ Intelligent Positioning
- Positions modal near click point when `clickPosition` is provided
- Automatically adjusts to stay within viewport bounds
- Falls back to center positioning if click position not provided

### ✅ Responsive Design
- Full-screen on mobile devices (< 640px)
- Responsive sizing on desktop
- Maintains proper padding and spacing

### ✅ Accessibility
- Focus trap (Tab cycles within modal)
- ESC key closes modal
- ARIA attributes for screen readers
- Keyboard navigation support

### ✅ User Experience
- Body scroll lock (prevents background scrolling)
- Smooth animations (fade-in backdrop, zoom-in modal)
- Click-outside-to-close (configurable)
- Scroll position restoration

## Clean Architecture Compliance

- **Infrastructure Layer**: BaseModal provides reusable UI infrastructure
- **Presentation Layer**: Specific modals (ParentBookingModal, TrainerActivityModal) use BaseModal
- **DRY Principle**: All modal infrastructure code centralized in BaseModal
- **Single Responsibility**: BaseModal handles modal infrastructure, specific modals handle business logic
- **Open/Closed Principle**: Extend BaseModal for new use cases without modifying it

## Migration Guide

### Before (Duplicated Modal Infrastructure)

```tsx
// ❌ BAD: Each modal duplicates infrastructure code
export default function MyModal({ isOpen, onClose }) {
  const [modalPosition, setModalPosition] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef(null);
  
  // 100+ lines of positioning, focus trap, scroll lock code...
  
  return (
    <div className="fixed inset-0 z-[1000]...">
      <div ref={modalRef} className="...">
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### After (Using BaseModal)

```tsx
// ✅ GOOD: Use BaseModal, focus on business logic
import { BaseModal } from '@/components/ui/Modal';

export default function MyModal({ isOpen, onClose }) {
  // Only business logic here, no infrastructure code
  
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="My Modal">
      {/* Only modal content */}
    </BaseModal>
  );
}
```

## Best Practices

1. **Use BaseModal for all modals** - Don't duplicate modal infrastructure
2. **Keep business logic separate** - BaseModal handles infrastructure, your component handles logic
3. **Use appropriate sizes** - Choose size based on content (sm, md, lg, xl, full)
4. **Provide click position when available** - Improves UX by positioning near user action
5. **Use footer prop for actions** - Keeps footer consistent and accessible
6. **Test on mobile** - BaseModal handles mobile automatically, but test your content

## Related Components

- `Button` - Used in modal footers
- `Input` - Used in modal forms
- Other UI components - Use any UI component inside BaseModal
