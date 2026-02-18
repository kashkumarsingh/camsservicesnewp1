'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SafeguardingCardProps {
  onReportConcern?: () => void;
  showPriorityContent?: boolean;
}

/**
 * Safeguarding Card (Parent Dashboard)
 * Purpose: Dedicated section for parents to report safeguarding concerns.
 * Renders after Session Notes in DashboardRightSidebar.
 */
export default function SafeguardingCard({
  onReportConcern,
  showPriorityContent = false,
}: SafeguardingCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dadce0] dark:border-gray-600 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e8eaed] dark:border-gray-700">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400 flex items-center gap-2">
          <ShieldAlert size={14} className="text-[#5f6368] dark:text-gray-400" aria-hidden />
          Safeguarding
        </h3>
        <p className="text-xs text-[#5f6368] dark:text-gray-400 mt-1">
          Report a concern about a child&rsquo;s safety or wellbeing.
        </p>
      </div>
      <div className="px-4 py-3">
        {onReportConcern ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReportConcern}
            className="w-full justify-center border-[#dadce0] dark:border-gray-600 text-[#1a73e8] dark:text-blue-400 hover:bg-[#e8f0fe] dark:hover:bg-blue-900/20"
            icon={showPriorityContent ? undefined : <ShieldAlert size={14} />}
          >
            Report a concern
          </Button>
        ) : (
          <p className="text-xs text-[#5f6368] dark:text-gray-400">
            If you have a safeguarding concern, please contact your Designated Safeguarding Lead.
          </p>
        )}
      </div>
    </div>
  );
}
