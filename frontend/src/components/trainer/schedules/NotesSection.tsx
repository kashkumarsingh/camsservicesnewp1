'use client';

import React, { useState, useEffect } from 'react';
import { trainerScheduleRepository } from '@/infrastructure/http/trainer/TrainerScheduleRepository';
import type { TrainerNote, CreateNoteRequest } from '@/core/application/trainer/types';
import { Plus, FileText, AlertCircle, MessageSquare, CheckCircle, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

interface NotesSectionProps {
  scheduleId: number;
}

export default function NotesSection({ scheduleId }: NotesSectionProps) {
  const [notes, setNotes] = useState<TrainerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    note: '',
    type: 'general' as 'general' | 'incident' | 'feedback' | 'attendance',
    is_private: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [scheduleId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await trainerScheduleRepository.getNotes(scheduleId);
      setNotes(response.notes);
    } catch (err: any) {
      console.error('Failed to fetch notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.note.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const noteData: CreateNoteRequest = {
        note: newNote.note.trim(),
        type: newNote.type,
        is_private: newNote.is_private,
      };

      await trainerScheduleRepository.createNote(scheduleId, noteData);

      // Reset form
      setNewNote({
        note: '',
        type: 'general',
        is_private: false,
      });
      setShowAddForm(false);

      // Refresh notes
      await fetchNotes();
    } catch (err: any) {
      console.error('Failed to create note:', err);
      setError(err.message || 'Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertCircle className="h-4 w-4" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4" />;
      case 'attendance':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'incident':
        return 'bg-red-100 text-red-800';
      case 'feedback':
        return 'bg-blue-100 text-blue-800';
      case 'attendance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-4">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Notes</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Type
            </label>
            <select
              value={newNote.type}
              onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="incident">Incident</option>
              <option value="feedback">Feedback</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={newNote.note}
              onChange={(e) => setNewNote(prev => ({ ...prev, note: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-transparent"
              placeholder="Enter your note here..."
            />
          </div>
          <div className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="is_private"
              checked={newNote.is_private}
              onChange={(e) => setNewNote(prev => ({ ...prev, is_private: e.target.checked }))}
              className="w-4 h-4 text-[#0080FF] border-gray-300 rounded focus:ring-[#0080FF]"
            />
            <label htmlFor="is_private" className="text-sm text-gray-700 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Private note (not visible to parents)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddNote} disabled={saving || !newNote.note.trim()}>
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
            <Button onClick={() => {
              setShowAddForm(false);
              setNewNote({ note: '', type: 'general', is_private: false });
            }} variant="outline" disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No notes yet. Add a note to get started.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getNoteTypeColor(note.type)}`}>
                    {getNoteTypeIcon(note.type)}
                    {note.type}
                  </span>
                  {note.is_private && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Private
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

