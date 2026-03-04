'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * BaseModal Component (UNIVERSAL & REUSABLE)
 * 
 * Clean Architecture: Infrastructure/Presentation Layer (UI Component)
 * Purpose: Universal modal component with intelligent positioning, accessibility, and responsive design
 * Location: frontend/src/components/ui/Modal/BaseModal.tsx
 * 
 * Features:
 * - Intelligent positioning (click-based or centered)
 * - Viewport detection (prevents off-screen positioning)
 * - Mobile-first (full-screen on mobile, responsive on desktop)
 * - Focus trap (keyboard navigation)
 * - Body scroll lock (prevents background scrolling)
 * - ESC key support
 * - Click-outside-to-close
 * - Smooth animations
 * - ARIA attributes for accessibility
 * 
 * Usage Examples:
 * 
 * 1. Simple Modal:
 * ```tsx
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="My Modal"
 * >
 *   <p>Modal content here</p>
 * </BaseModal>
 * ```
 * 
 * 2. Modal with Custom Header/Footer:
 * ```tsx
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   header={<CustomHeader />}
 *   footer={<CustomFooter />}
 * >
 *   <p>Modal content here</p>
 * </BaseModal>
 * ```
 * 
 * 3. Modal with Click Position:
 * ```tsx
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Positioned Modal"
 *   clickPosition={{ x: 500, y: 300 }}
 * >
 *   <p>Modal positioned near click</p>
 * </BaseModal>
 * ```
 * 
 * 4. Modal without Header:
 * ```tsx
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   showHeader={false}
 * >
 *   <p>Full custom content</p>
 * </BaseModal>
 * ```
 */

export interface BaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title (rendered in header if showHeader is true) */
  title?: string | ReactNode;
  /** Custom header component (overrides title if provided) */
  header?: ReactNode;
  /** Custom footer component */
  footer?: ReactNode;
  /** Modal content */
  children: ReactNode;
  /** Optional click position for intelligent positioning */
  clickPosition?: { x: number; y: number };
  /** Show default header (default: true) */
  showHeader?: boolean;
  /** Show close button (default: true) */
  showCloseButton?: boolean;
  /** Modal size variants */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Custom className for modal content */
  contentClassName?: string;
  /** Prevent closing on backdrop click (default: false) */
  preventBackdropClose?: boolean;
  /** Custom aria-label for modal */
  ariaLabel?: string;
  /** Custom aria-labelledby for modal */
  ariaLabelledBy?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  header,
  footer,
  children,
  clickPosition,
  showHeader = true,
  showCloseButton = true,
  size = 'md',
  contentClassName = '',
  preventBackdropClose = false,
  ariaLabel,
  ariaLabelledBy,
}: BaseModalProps) {
  const [modalPosition, setModalPosition] = useState<{ top?: number; left?: number; transform?: string }>({});
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for focus trap and positioning
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intelligent positioning: Calculate optimal modal position based on click position and viewport
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    // On mobile, use full-screen positioning
    if (isMobile) {
      setModalPosition({});
      return;
    }
    
    const modal = modalRef.current;
    const modalRect = modal.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16; // Minimum padding from viewport edges
    
    let top: number | undefined;
    let left: number | undefined;
    let transform: string | undefined;
    
    // If click position provided, try to position near click
    if (clickPosition) {
      const { x, y } = clickPosition;
      
      // Calculate initial position (centered on click)
      let calculatedLeft = x - modalRect.width / 2;
      let calculatedTop = y - modalRect.height / 2;
      
      // Adjust if modal would go off-screen horizontally
      if (calculatedLeft < padding) {
        calculatedLeft = padding;
      } else if (calculatedLeft + modalRect.width > viewportWidth - padding) {
        calculatedLeft = viewportWidth - modalRect.width - padding;
      }
      
      // Adjust if modal would go off-screen vertically
      if (calculatedTop < padding) {
        calculatedTop = padding;
      } else if (calculatedTop + modalRect.height > viewportHeight - padding) {
        calculatedTop = viewportHeight - modalRect.height - padding;
      }
      
      // Only use calculated position if it's significantly different from center
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(calculatedLeft - centerX, 2) + Math.pow(calculatedTop - centerY, 2)
      );
      
      // If click is far from center (>200px), use calculated position
      if (distanceFromCenter > 200) {
        top = calculatedTop;
        left = calculatedLeft;
        transform = 'none'; // Override default centering
      }
    }
    
    // Viewport detection: Ensure modal fits on screen
    if (top !== undefined && left !== undefined) {
      // Double-check bounds
      if (top < padding) top = padding;
      if (left < padding) left = padding;
      if (top + modalRect.height > viewportHeight - padding) {
        top = viewportHeight - modalRect.height - padding;
      }
      if (left + modalRect.width > viewportWidth - padding) {
        left = viewportWidth - modalRect.width - padding;
      }
    }
    
    setModalPosition({ top, left, transform });
  }, [isOpen, clickPosition, isMobile]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Focus trap: Keep focus within modal
  useEffect(() => {
    if (!isOpen) return;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement> | undefined;
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    
    // Focus first element when modal opens
    const timer = setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement | null;
      firstFocusable?.focus();
    }, 100);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalId = ariaLabelledBy || (title ? 'base-modal-title' : undefined);

  const modal = (
    <div
      className={`fixed inset-0 z-modal flex min-h-screen bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 ${
        isMobile ? 'items-end justify-center p-0' : 'items-center justify-center p-2 sm:p-4'
      }`}
      onClick={(e) => {
        // Close modal when clicking backdrop (unless prevented)
        if (!preventBackdropClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        // Close modal on ESC key
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
      aria-label={ariaLabel}
    >
      <div 
        ref={modalRef}
        className={`relative z-10 bg-white dark:bg-slate-900 shadow-2xl w-full flex flex-col transform transition-all animate-in duration-200 ${
          isMobile 
            ? 'max-h-[90vh] rounded-t-2xl animate-in slide-in-from-bottom duration-200'
            : `rounded-2xl ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] min-h-[50vh] sm:min-h-0 mx-4 zoom-in-95`
        } ${contentClassName}`}
        style={{
          ...(modalPosition.top !== undefined && { top: `${modalPosition.top}px` }),
          ...(modalPosition.left !== undefined && { left: `${modalPosition.left}px` }),
          ...(modalPosition.transform && { transform: modalPosition.transform }),
          ...(modalPosition.top !== undefined && { position: 'fixed' }),
        }}
        onClick={(e) => {
          // Prevent backdrop close when clicking inside modal
          e.stopPropagation();
        }}
      >
        {/* Mobile: drag handle (visual only) */}
        {isMobile && (
          <div className="flex shrink-0 justify-center pt-3 pb-1">
            <div className="h-1 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden />
          </div>
        )}
        {/* Header - Always sticky at top */}
        {showHeader && (
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700 flex-shrink-0 sticky top-0 bg-white dark:bg-slate-900 z-raised rounded-t-2xl md:p-6">
            {header || (
              <>
                {title && (
                  <h2 id={modalId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    ref={firstFocusableRef}
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-auto"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-slate-500 dark:text-slate-400" />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Content - Scrollable area (flex-1 ensures it takes available space); overflow-x-hidden + min-w-0 prevent horizontal scroll from negative-margin children */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain min-h-0 min-w-0 p-4 md:p-6">
          {children}
        </div>

        {/* Footer - Right-aligned actions, border-t (Google Calendar–style) */}
        {footer && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 flex-shrink-0 sticky bottom-0 z-raised rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}
