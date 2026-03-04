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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <ShieldAlert size={14} className="text-slate-600 dark:text-slate-400" aria-hidden />
          Safeguarding
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
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
            className="w-full justify-center"
            icon={showPriorityContent ? undefined : <ShieldAlert size={14} />}
          >
            Report a concern
          </Button>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            If you have a safeguarding concern, please contact your Designated Safeguarding Lead.
          </p>
        )}
      </div>
    </div>
  );
}
