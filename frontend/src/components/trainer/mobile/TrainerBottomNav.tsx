'use client';

import React from 'react';
import { CalendarCheck, UserCircle2 } from 'lucide-react';

export type TrainerBottomNavTab = 'schedule' | 'more';

export interface TrainerBottomNavProps {
  activeTab: TrainerBottomNavTab;
  onTabChange: (tab: TrainerBottomNavTab) => void;
  /** Optional class for the nav container */
  className?: string;
}

const TAB_CONFIG: { tab: TrainerBottomNavTab; label: string; icon: React.ElementType }[] = [
  { tab: 'schedule', label: 'Schedule', icon: CalendarCheck },
  { tab: 'more', label: 'More', icon: UserCircle2 },
];

/**
 * Bottom navigation for trainer app (mobile): Schedule | More (profile).
 * More shows trainer profile / Good morning + tagline and menu. White background, grey when inactive, blue when active.
 */
export default function TrainerBottomNav({
  activeTab,
  onTabChange,
  className = '',
}: TrainerBottomNavProps) {
  return (
    <nav
      className={`bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] ${className}`}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {TAB_CONFIG.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 py-2 min-w-0 ${
                isActive ? 'text-[#2196F3]' : 'text-gray-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} className="flex-shrink-0" aria-hidden />
              <span className="text-xs font-medium truncate w-full text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
