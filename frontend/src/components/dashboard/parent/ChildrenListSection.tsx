'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export interface ChildrenListItem {
  id: number;
  name: string;
  hoursRemaining: number;
}

interface ChildrenListSectionProps {
  children: ChildrenListItem[];
  onBookForChild: (childId: number) => void;
  onAddChildClick: () => void;
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function ChildrenListSection({
  children,
  onBookForChild,
  onAddChildClick,
}: ChildrenListSectionProps) {
  const hasChildren = children.length > 0;

  if (!hasChildren) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 px-6 py-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
            <span className="text-xl">👶</span>
            <span>Children</span>
          </h2>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No children added yet</p>
          <Button
            variant="primary"
            onClick={onAddChildClick}
            className="px-6 py-2 text-sm font-semibold"
          >
            + Add your first child
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 px-6 py-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <span className="text-xl">👶</span>
          <span>Children</span>
        </h2>
        <button
          type="button"
          onClick={onAddChildClick}
          className="px-4 py-1.5 text-sm font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          + Add Child
        </button>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Active ({children.length} {children.length === 1 ? 'child' : 'children'}):
        </p>
      </div>

      <div className="space-y-3">
        {children.map((child) => (
          <div
            key={child.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                {getInitials(child.name)}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {child.name}
                </div>
                <div className="text-sm text-gray-500">
                  {child.hoursRemaining.toFixed(1)}h left
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBookForChild(child.id)}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Book hrs →
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link
          href="/dashboard/parent/children"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Manage all children →
        </Link>
      </div>
    </section>
  );
}


