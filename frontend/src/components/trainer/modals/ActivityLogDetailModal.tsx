'use client';

import React, { useState } from 'react';
import type { ActivityLog } from '@/core/application/trainer/types';
import { BaseModal } from '@/components/ui/Modal';
import ActivityLogForm from '@/components/trainer/activities/ActivityLogForm';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Image as ImageIcon, Award, Edit, Lock } from 'lucide-react';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';
import Button from '@/components/ui/Button';

interface ActivityLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: ActivityLog | null;
  onUpdate?: () => void;
}

function formatDateShort(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTimeShort(d: string): string {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ActivityLogDetailModal({
  isOpen,
  onClose,
  log,
  onUpdate,
}: ActivityLogDetailModalProps) {
  const [editing, setEditing] = useState(false);

  if (!log) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle, label: 'Completed' };
      case 'in_progress':
        return { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: AlertCircle, label: 'In progress' };
      case 'needs_attention':
        return { class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: AlertCircle, label: 'Needs attention' };
      default:
        return { class: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200', icon: Clock, label: status.replace('_', ' ') };
    }
  };

  const handleUpdate = async () => {
    setEditing(false);
    onUpdate?.();
  };

  if (editing) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={() => {
          setEditing(false);
          onClose();
        }}
        title={
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Edit activity log</span>
            {log.child?.name && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getTrainerChildDisplayName(log.child.name)}
              </span>
            )}
          </div>
        }
        size="xl"
      >
        <ActivityLogForm
          childId={log.child_id}
          childName={log.child?.name || 'Child'}
          bookingId={log.booking_id || undefined}
          bookingScheduleId={log.booking_schedule_id || undefined}
          initialData={log}
          onSuccess={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </BaseModal>
    );
  }

  const statusConfig = getStatusConfig(log.status);
  const StatusIcon = statusConfig.icon;
  const hasReflection =
    Boolean(log.behavioral_observations?.trim()) ||
    Boolean(log.achievements?.trim()) ||
    Boolean(log.challenges?.trim());

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{log.activity_name}</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {log.child?.name && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5 shrink-0" />
                {getTrainerChildDisplayName(log.child.name)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {new Date(log.activity_date).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {log.start_time && log.end_time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {log.start_time.substring(0, 5)}–{log.end_time.substring(0, 5)}
              </span>
            )}
          </div>
        </div>
      }
      size="xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          {log.is_editable && (
            <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit log
            </Button>
          )}
          <Button onClick={onClose} variant="secondary" size="sm">
            Close
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto space-y-5">
        {/* Status & milestone */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.class}`}
          >
            <StatusIcon className="h-3.5 w-3.5 shrink-0" />
            {statusConfig.label}
          </span>
          {log.milestone_achieved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <Award className="h-3.5 w-3.5 shrink-0" />
              Milestone
            </span>
          )}
        </div>

        {/* What happened */}
        {(log.description || log.notes) && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              What happened
            </h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/30">
              {log.description && (
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{log.description}</p>
              )}
              {log.notes && (
                <div className={log.description ? 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-600' : ''}>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.notes}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Reflection: behaviour, achievements, challenges */}
        {hasReflection && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Session reflection
            </h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3 dark:border-gray-700 dark:bg-gray-800/30">
              {log.behavioral_observations?.trim() && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Behaviour</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {log.behavioral_observations}
                  </p>
                </div>
              )}
              {log.achievements?.trim() && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Achievements</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{log.achievements}</p>
                </div>
              )}
              {log.challenges?.trim() && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Challenges</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{log.challenges}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Milestone detail */}
        {log.milestone_achieved && (log.milestone_name || log.milestone_description) && (
          <section className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">Milestone</p>
            {log.milestone_name && (
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{log.milestone_name}</p>
            )}
            {log.milestone_description && (
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1 whitespace-pre-wrap">
                {log.milestone_description}
              </p>
            )}
          </section>
        )}

        {/* Photos */}
        {log.photos && log.photos.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Photos ({log.photos.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {log.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Activity photo ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ))}
            </div>
          </section>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span>Logged {formatDateTimeShort(log.created_at)}</span>
          {log.updated_at !== log.created_at && (
            <span>Updated {formatDateTimeShort(log.updated_at)}</span>
          )}
          {log.is_editable && log.editable_until ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              Editable until {formatDateTimeShort(log.editable_until)}
            </span>
          ) : !log.is_editable ? (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3 shrink-0" />
              Editing closed
            </span>
          ) : null}
        </div>
      </div>
    </BaseModal>
  );
}
