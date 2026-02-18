'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';
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

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 ${
        isMobile ? 'p-0' : ''
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
        className={`bg-white dark:bg-gray-900 shadow-2xl w-full flex flex-col transform transition-all animate-in zoom-in-95 duration-200 ${
          isMobile 
            ? 'rounded-none h-screen max-h-screen' 
            : `rounded-lg sm:rounded-xl ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] min-h-[50vh] sm:min-h-0`
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
        {/* Header - Always sticky at top */}
        {showHeader && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-lg sm:rounded-t-xl">
            {header || (
              <>
                {title && (
                  <h2 id={modalId} className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    ref={firstFocusableRef}
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Content - Scrollable area (flex-1 ensures it takes available space) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 overscroll-contain min-h-0">
          {children}
        </div>

        {/* Footer - Always sticky at bottom (flex-shrink-0 prevents shrinking, sticky ensures visibility) */}
        {footer && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5 bg-white dark:bg-gray-900 flex-shrink-0 sticky bottom-0 z-10 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.3)] rounded-b-lg sm:rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
