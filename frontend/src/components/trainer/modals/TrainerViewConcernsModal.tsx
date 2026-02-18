'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ShieldAlert, Info, Loader2, Calendar, User, AlertCircle, Check } from 'lucide-react';
import BaseModal from '@/components/ui/Modal/BaseModal';
import { useTrainerSafeguardingConcerns, type TrainerSafeguardingConcernItem } from '@/interfaces/web/hooks/trainer/useTrainerSafeguardingConcerns';
import { toastManager } from '@/utils/toast';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';

interface TrainerViewConcernsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatConcernType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface ConcernCardProps {
  item: TrainerSafeguardingConcernItem;
  onAcknowledge: (id: number) => Promise<void>;
  onSaveNote: (id: number, note: string) => Promise<void>;
  updatingConcernId: number | null;
}

function ConcernCard({ item, onAcknowledge, onSaveNote, updatingConcernId }: ConcernCardProps) {
  const [noteDraft, setNoteDraft] = useState(item.trainerNote ?? '');
  const isUpdating = updatingConcernId === item.id;

  useEffect(() => {
    setNoteDraft(item.trainerNote ?? '');
  }, [item.trainerNote]);

  const dateLabel = item.dateOfConcern
    ? new Date(item.dateOfConcern).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const submittedLabel = new Date(item.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const acknowledgedLabel = item.trainerAcknowledgedAt
    ? new Date(item.trainerAcknowledgedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const handleSaveNote = useCallback(async () => {
    const trimmed = noteDraft.trim();
    await onSaveNote(item.id, trimmed);
    if (trimmed) toastManager.success('Note saved. The Designated Safeguarding Lead will see it.');
  }, [item.id, noteDraft, onSaveNote]);

  return (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 space-y-2">
      {/* One line: type · status · date */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
        <span className="font-medium text-[#2C5F8D] dark:text-blue-400">{formatConcernType(item.concernType)}</span>
        <span aria-hidden>·</span>
        <span className="rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
          {formatStatus(item.status)}
        </span>
        {dateLabel && (
          <>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden />
              {dateLabel}
            </span>
          </>
        )}
      </div>
      <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap line-clamp-4">{item.description}</p>
      {/* One line: child, reporter, submitted */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
        {item.childName && (
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3" aria-hidden />
            {getTrainerChildDisplayName(item.childName)}
          </span>
        )}
        {item.reportedByName && <span>{item.reportedByName}</span>}
        <span>{submittedLabel}</span>
      </div>
      {/* Actions: acknowledge + single note field */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-600 space-y-2">
        <div className="flex items-center gap-2">
          {item.trainerAcknowledgedAt ? (
            <span className="text-xs text-green-700 dark:text-green-400 inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" aria-hidden />
              Acknowledged {acknowledgedLabel}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onAcknowledge(item.id)}
              disabled={isUpdating}
              className="text-xs font-medium text-[#2C5F8D] dark:text-blue-400 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
            >
              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> : <Check className="w-3.5 h-3.5" aria-hidden />}
              Acknowledge
            </button>
          )}
        </div>
        <div>
          <label htmlFor={`concern-note-${item.id}`} className="sr-only">
            Note for Designated Safeguarding Lead
          </label>
          <textarea
            id={`concern-note-${item.id}`}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Add note for DSL (optional)"
            rows={2}
            className="w-full rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 resize-none px-3 py-2"
            disabled={isUpdating}
            aria-label="Note for Designated Safeguarding Lead"
          />
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={isUpdating}
            className="mt-1 text-xs font-medium text-[#2C5F8D] dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {isUpdating ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Trainer View Parent Concerns Modal
 *
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Trainers see safeguarding concerns that relate to children they have sessions with.
 * Data: Fetched from GET /api/v1/trainer/safeguarding-concerns when modal opens.
 */
export default function TrainerViewConcernsModal({ isOpen, onClose }: TrainerViewConcernsModalProps) {
  const { concerns, loading, error, updateConcern } = useTrainerSafeguardingConcerns(isOpen);
  const [updatingConcernId, setUpdatingConcernId] = useState<number | null>(null);

  const handleAcknowledge = useCallback(async (id: number) => {
    setUpdatingConcernId(id);
    try {
      await updateConcern(id, { acknowledged: true });
      toastManager.success('Concern acknowledged.');
      onClose();
    } catch {
      toastManager.error('Could not acknowledge. Please try again.');
    } finally {
      setUpdatingConcernId(null);
    }
  }, [updateConcern, onClose]);

  const handleSaveNote = useCallback(async (id: number, note: string) => {
    setUpdatingConcernId(id);
    try {
      await updateConcern(id, { note: note || null, acknowledged: true });
      if (note.trim()) toastManager.success('Note saved. The Designated Safeguarding Lead will see it.');
      onClose();
    } catch {
      toastManager.error('Could not save note. Please try again.');
    } finally {
      setUpdatingConcernId(null);
    }
  }, [updateConcern, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Parent concerns"
      size="lg"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#2C5F8D] text-white text-sm font-medium hover:bg-[#244a73] focus:outline-none focus:ring-2 focus:ring-[#2C5F8D] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Concerns from parents about children you have sessions with. DSL will follow up.
        </p>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#2C5F8D]" aria-hidden />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Could not load concerns</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && concerns.length === 0 && (
          <div className="flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400">
            <Info className="h-4 w-4 flex-shrink-0" aria-hidden />
            <span>No concerns related to your sessions.</span>
          </div>
        )}

        {!loading && !error && concerns.length > 0 && (
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {concerns.map((item) => (
              <ConcernCard
                key={item.id}
                item={item}
                onAcknowledge={handleAcknowledge}
                onSaveNote={handleSaveNote}
                updatingConcernId={updatingConcernId}
              />
            ))}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
