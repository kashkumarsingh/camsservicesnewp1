'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

type EditorMode = 'visual' | 'html';

interface PageContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const TinyMCEEditor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
  { ssr: false, loading: () => <div className="min-h-[240px] rounded-md border border-slate-200 bg-slate-50 animate-pulse dark:border-slate-700 dark:bg-slate-900" /> }
);

/**
 * Page content editor with TinyMCE (Visual) and HTML (advanced) modes.
 * Visual is the default for non-technical users; HTML is for direct editing.
 */
export const PageContentEditor: React.FC<PageContentEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your page content here.',
  disabled = false,
  'aria-label': ariaLabel = 'Page content',
}) => {
  const [mode, setMode] = useState<EditorMode>('visual');

  const handleTinyMCEChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  const apiKey = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_TINYMCE_API_KEY
    ? process.env.NEXT_PUBLIC_TINYMCE_API_KEY
    : undefined;

  return (
    <div className="space-y-2">
      {/* Tabs: Visual (TinyMCE) | HTML (advanced) */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'visual'}
          onClick={() => setMode('visual')}
          className={`rounded-t border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'visual'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Visual
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'html'}
          onClick={() => setMode('html')}
          className={`rounded-t border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'html'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          HTML (advanced)
        </button>
      </div>

      {mode === 'visual' && (
        <div className="rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 [&_.tox-tinymce]:rounded-md">
          <TinyMCEEditor
            id="content"
            apiKey={apiKey}
            value={value}
            onEditorChange={handleTinyMCEChange}
            disabled={disabled}
            init={{
              placeholder,
              height: 320,
              menubar: false,
              statusbar: false,
              plugins: 'lists link code',
              toolbar: 'bold italic | bullist numlist | link | code',
              content_style: 'body { font-family: inherit; font-size: 14px; }',
              branding: false,
              promotion: false,
              resize: true,
              skin: 'oxide',
              content_css: 'default',
            }}
            aria-label={ariaLabel}
          />
        </div>
      )}

      {mode === 'html' && (
        <textarea
          id="content"
          rows={15}
          placeholder="Enter your page content here. HTML is supported."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={ariaLabel}
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        />
      )}

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {mode === 'visual'
          ? 'Use the toolbar to format text. Switch to HTML (advanced) to edit raw HTML.'
          : 'Edit raw HTML. Switch to Visual for a simpler editor.'}
      </p>
    </div>
  );
};
