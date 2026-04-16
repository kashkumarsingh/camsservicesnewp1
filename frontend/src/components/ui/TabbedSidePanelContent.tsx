'use client';

import React from 'react';
import type { IconComponent } from '@/shared/types/icons';

export interface TabbedSidePanelTab {
  id: string;
  label: string;
  icon?: IconComponent;
  content: React.ReactNode;
}

export interface TabbedSidePanelContentProps {
  /** Tabs: id, label, optional icon, content. */
  tabs: TabbedSidePanelTab[];
  /** Currently active tab id (controlled). */
  activeTabId: string;
  /** Called when user selects a different tab. */
  onTabChange: (id: string) => void;
  /** Optional aria-label for the tablist (e.g. "Booking details"). */
  ariaLabel?: string;
  /** Optional class for the scrollable panel content area. */
  contentClassName?: string;
}

/**
 * Tabbed content for side panels (SideCanvas).
 * Default behaviour when a side panel shows many distinct sections: use tabs so the panel stays scannable.
 * Renders a tab list (with optional icons) and the active tab's content in a scrollable area.
 */
export function TabbedSidePanelContent({
  tabs,
  activeTabId,
  onTabChange,
  ariaLabel = 'Sections',
  contentClassName = '',
}: TabbedSidePanelContentProps) {
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav
        className="-mx-4 flex shrink-0 border-b border-slate-200 px-4 dark:border-slate-700 md:-mx-6 md:px-6"
        aria-label={ariaLabel}
        role="tablist"
      >
        <div className="flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-selected={activeTabId === id}
              role="tab"
              className={`flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-2xs font-medium transition-colors ${
                activeTabId === id
                  ? 'border-primary-blue bg-primary-blue/5 text-primary-blue dark:text-primary-blue'
                  : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {label}
            </button>
          ))}
        </div>
      </nav>
      <div
        className={`min-h-0 flex-1 overflow-y-auto py-4 text-sm ${contentClassName}`.trim()}
        role="tabpanel"
      >
        {activeTab?.content}
      </div>
    </div>
  );
}
