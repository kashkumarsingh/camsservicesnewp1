/**
 * Table Rows Skeleton Component
 *
 * Reusable skeleton for table body loading states (e.g. admin bookings table).
 * Uses centralized counts from skeletonConstants.
 */

import React from 'react';

interface TableRowsSkeletonProps {
  rowCount?: number;
  colCount?: number;
}

export default function TableRowsSkeleton({ rowCount = 5, colCount = 8 }: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <tr
          key={`table-row-skeleton-${rowIndex}`}
          className="border-b border-slate-200 dark:border-slate-700 animate-pulse"
          aria-busy="true"
        >
          {Array.from({ length: colCount }, (_, colIndex) => (
            <td key={`table-cell-skeleton-${rowIndex}-${colIndex}`} className="px-3 py-2">
              <div
                className={`h-4 bg-slate-200 dark:bg-slate-700 rounded ${
                  colIndex === 0 ? 'w-4' : colIndex === colCount - 1 ? 'w-20' : 'w-24 max-w-full'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
