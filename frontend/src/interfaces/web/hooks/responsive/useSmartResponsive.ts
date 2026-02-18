'use client';

import { useState, useEffect, useMemo } from 'react';

/**
 * Device Type Detection
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type InputType = 'touch' | 'mouse' | 'hybrid';
export type Orientation = 'portrait' | 'landscape';

/**
 * Responsive Breakpoints
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1280,
  /** Extra-wide (e.g. maximise calendar, consider week view default, more spacing) */
  extraWide: 1920,
} as const;

/**
 * Context-Aware Responsive Hook
 * 
 * Detects device capabilities, screen size, and user context to provide
 * intelligent responsive behavior beyond simple breakpoints.
 */
export interface SmartResponsiveConfig {
  /** Number of items (children, bookings, etc.) - affects layout density */
  itemCount?: number;
  /** Whether there are pending actions - affects priority display */
  hasPendingActions?: boolean;
  /** Whether content is empty - affects empty state display */
  isEmpty?: boolean;
  /** Whether user is actively interacting (modal open, form active) */
  isInteracting?: boolean;
}

export interface SmartResponsiveReturn {
  // Device Detection
  deviceType: DeviceType;
  inputType: InputType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isExtraWide: boolean; // >= 1920px

  // Screen Dimensions
  width: number;
  height: number;
  isNarrow: boolean; // < 640px
  isWide: boolean; // >= 1280px
  
  // Context-Aware Layout Decisions
  showSidebar: boolean; // Should show left sidebar
  showCompactView: boolean; // Should use compact layout
  showFullDetails: boolean; // Should show full details
  showActionsInline: boolean; // Should show actions inline vs stacked
  showPriorityContent: boolean; // Should prioritize important content
  
  // Adaptive Spacing
  spacing: 'compact' | 'normal' | 'comfortable';
  padding: 'small' | 'medium' | 'large';
  textSize: 'small' | 'medium' | 'large';
  
  // Touch Optimizations
  touchTargetSize: 'small' | 'medium' | 'large';
  showTouchHints: boolean;
  
  // Content Density
  layoutDensity: 'sparse' | 'normal' | 'dense';
  maxVisibleItems: number;
}

export function useSmartResponsive(config: SmartResponsiveConfig = {}): SmartResponsiveReturn {
  const {
    itemCount = 0,
    hasPendingActions = false,
    isEmpty = false,
    isInteracting = false,
  } = config;

  // Screen dimensions
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  // Device capabilities
  const [inputType, setInputType] = useState<InputType>('mouse');
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      // Detect orientation
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    // Detect input type (touch vs mouse)
    const detectInputType = () => {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Has touch capability
        if (window.matchMedia('(pointer: fine)').matches) {
          // Also has precise pointer (hybrid device like Surface)
          setInputType('hybrid');
        } else {
          setInputType('touch');
        }
      } else {
        setInputType('mouse');
      }
    };

    handleResize();
    detectInputType();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Re-detect input type on pointer changes
    window.addEventListener('pointerdown', detectInputType);
    window.addEventListener('mousedown', detectInputType);
    window.addEventListener('touchstart', detectInputType);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('pointerdown', detectInputType);
      window.removeEventListener('mousedown', detectInputType);
      window.removeEventListener('touchstart', detectInputType);
    };
  }, []);

  // Compute device type
  const deviceType = useMemo<DeviceType>(() => {
    if (dimensions.width < BREAKPOINTS.tablet) return 'mobile';
    if (dimensions.width < BREAKPOINTS.desktop) return 'tablet';
    return 'desktop';
  }, [dimensions.width]);

  // Compute responsive values
  const responsive = useMemo<SmartResponsiveReturn>(() => {
    const { width, height } = dimensions;
    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop';
    const isLargeDesktop = width >= BREAKPOINTS.largeDesktop;
    const isExtraWide = width >= BREAKPOINTS.extraWide;
    const isNarrow = width < 640;
    const isWide = width >= BREAKPOINTS.largeDesktop;

    // Context-aware sidebar visibility
    // Show sidebar on desktop/tablet landscape, hide on mobile or when interacting
    const showSidebar = (isDesktop || (isTablet && orientation === 'landscape')) && !isInteracting;

    // Compact view for mobile or when many items
    const showCompactView = isMobile || (isTablet && itemCount > 5) || isInteracting;

    // Full details on desktop or when few items
    const showFullDetails = isDesktop && itemCount <= 10 && !isEmpty;

    // Actions inline on desktop/tablet, stacked on mobile
    const showActionsInline = (isDesktop || (isTablet && !isNarrow)) && !isInteracting;

    // Priority content (pending actions, urgent items) always visible
    const showPriorityContent = hasPendingActions || isEmpty || itemCount === 0;

    // Adaptive spacing based on device and content density
    let spacing: 'compact' | 'normal' | 'comfortable' = 'normal';
    if (isMobile || showCompactView) {
      spacing = 'compact';
    } else if (isLargeDesktop && itemCount < 5) {
      spacing = 'comfortable';
    }

    // Adaptive padding
    let padding: 'small' | 'medium' | 'large' = 'medium';
    if (isMobile) {
      padding = 'small';
    } else if (isLargeDesktop && !showCompactView) {
      padding = 'large';
    }

    // Adaptive text size
    let textSize: 'small' | 'medium' | 'large' = 'medium';
    if (isMobile || isNarrow) {
      textSize = 'small';
    } else if (isLargeDesktop) {
      textSize = 'large';
    }

    // Touch target size (minimum 44px for accessibility)
    const touchTargetSize: 'small' | 'medium' | 'large' = 
      inputType === 'touch' || inputType === 'hybrid' ? 'large' : 'medium';

    // Show touch hints on touch devices
    const showTouchHints = inputType === 'touch' && isMobile;

    // Layout density based on screen size and item count
    let layoutDensity: 'sparse' | 'normal' | 'dense' = 'normal';
    if (isMobile || itemCount > 10) {
      layoutDensity = 'dense';
    } else if (isLargeDesktop && itemCount < 5) {
      layoutDensity = 'sparse';
    }

    // Max visible items before pagination/scroll
    let maxVisibleItems: number;
    if (isMobile) {
      maxVisibleItems = 3;
    } else if (isTablet) {
      maxVisibleItems = 5;
    } else if (isDesktop) {
      maxVisibleItems = 8;
    } else {
      maxVisibleItems = 12; // Large desktop
    }

    return {
      deviceType,
      inputType,
      orientation,
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      isExtraWide,
      width,
      height,
      isNarrow,
      isWide,
      showSidebar,
      showCompactView,
      showFullDetails,
      showActionsInline,
      showPriorityContent,
      spacing,
      padding,
      textSize,
      touchTargetSize,
      showTouchHints,
      layoutDensity,
      maxVisibleItems,
    };
  }, [
    dimensions,
    deviceType,
    orientation,
    inputType,
    itemCount,
    hasPendingActions,
    isEmpty,
    isInteracting,
  ]);

  return responsive;
}

/**
 * Helper hook for simple breakpoint detection
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<keyof typeof BREAKPOINTS>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.tablet) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}
