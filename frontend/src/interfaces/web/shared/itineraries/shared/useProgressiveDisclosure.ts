/**
 * Progressive Disclosure Hook
 * 
 * Manages step-by-step form disclosure where sections unlock as previous ones are completed.
 * Follows DRY principle - reusable across all itinerary types.
 */

import { useState, useEffect, useMemo } from 'react';

export interface SectionState {
  [key: string]: boolean;
}

export interface ValidationState {
  [key: string]: boolean;
}

export interface UseProgressiveDisclosureOptions {
  sections: string[]; // Ordered list of section keys, e.g., ['event', 'transport', 'options']
  validations: ValidationState; // Validation state for each section
  autoExpand?: boolean; // Auto-expand next section when current becomes valid
}

export function useProgressiveDisclosure({
  sections,
  validations,
  autoExpand = true,
}: UseProgressiveDisclosureOptions) {
  // Initialize: first section open, others closed
  const [open, setOpen] = useState<SectionState>(() => {
    const initial: SectionState = {};
    sections.forEach((key, idx) => {
      initial[key] = idx === 0; // Only first section open
    });
    return initial;
  });

  // Auto-expand next section when current becomes valid
  useEffect(() => {
    if (!autoExpand) return;

    for (let i = 0; i < sections.length - 1; i++) {
      const currentKey = sections[i];
      const nextKey = sections[i + 1];
      
      if (validations[currentKey] && !open[nextKey]) {
        setOpen(prev => ({ ...prev, [nextKey]: true }));
        break; // Only expand one at a time
      }
    }
  }, [validations, sections, open, autoExpand]);

  const toggleSection = (key: string) => {
    // Only allow toggling if previous sections are valid
    const idx = sections.indexOf(key);
    if (idx > 0) {
      const prevKey = sections[idx - 1];
      if (!validations[prevKey]) return; // Can't open if previous invalid
    }
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isSectionEnabled = (key: string): boolean => {
    const idx = sections.indexOf(key);
    if (idx === 0) return true; // First section always enabled
    const prevKey = sections[idx - 1];
    return validations[prevKey] === true;
  };

  const isSectionOpen = (key: string): boolean => {
    return open[key] === true;
  };

  return {
    isSectionOpen,
    isSectionEnabled,
    toggleSection,
  };
}

