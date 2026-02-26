'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BaseModal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { AdminPageBlockDTO, PageBlockMetaDTO } from '@/core/application/pages/dto/PageDTO';
import type {
  HeroBlockPayload,
  RichTextBlockPayload,
  CtaBlockPayload,
  FaqBlockPayload,
  FeaturesBlockPayload,
  StatsBlockPayload,
  TeamBlockPayload,
  TestimonialsBlockPayload,
} from '@/components/public-page-blocks/types';
import { BLOCK_TYPE_LABELS } from '@/utils/pageBuilderConstants';

interface BlockEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: AdminPageBlockDTO;
  onSave: (payload: Record<string, unknown>, meta?: PageBlockMetaDTO | null) => Promise<void>;
}

const emptyMeta = (): PageBlockMetaDTO => ({
  visibleFrom: undefined,
  visibleUntil: undefined,
  hideOnMobile: undefined,
});

export function BlockEditModal({ isOpen, onClose, block, onSave }: BlockEditModalProps) {
  const [payload, setPayload] = useState<Record<string, unknown>>(block.payload ?? {});
  const [meta, setMeta] = useState<PageBlockMetaDTO>(() => block.meta ?? emptyMeta());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPayload(block.payload ?? {});
      setMeta(block.meta ?? emptyMeta());
    }
  }, [isOpen, block.id, block.payload, block.meta]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(payload, meta);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [payload, meta, onSave, onClose]);

  const labelClass = 'block text-xs font-medium text-slate-700 dark:text-slate-200';
  const inputClass =
    'mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50';
  const textareaClass =
    'mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50';

  const update = (key: string, value: unknown) => setPayload((prev) => ({ ...prev, [key]: value }));

  const renderForm = () => {
    switch (block.type) {
      case 'hero': {
        const p = payload as HeroBlockPayload;
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={(p.title ?? '') as string}
                onChange={(e) => update('title', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                type="text"
                value={(p.subtitle ?? '') as string}
                onChange={(e) => update('subtitle', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary CTA text</label>
              <input
                type="text"
                value={(p.primaryCtaText ?? '') as string}
                onChange={(e) => update('primaryCtaText', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary CTA href</label>
              <input
                type="text"
                value={(p.primaryCtaHref ?? '') as string}
                onChange={(e) => update('primaryCtaHref', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secondary CTA text</label>
              <input
                type="text"
                value={(p.secondaryCtaText ?? '') as string}
                onChange={(e) => update('secondaryCtaText', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Secondary CTA href</label>
              <input
                type="text"
                value={(p.secondaryCtaHref ?? '') as string}
                onChange={(e) => update('secondaryCtaHref', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );
      }
      case 'rich_text': {
        const p = payload as RichTextBlockPayload;
        return (
          <div>
            <label className={labelClass}>Content (HTML)</label>
            <textarea
              rows={8}
              value={(p.content ?? '') as string}
              onChange={(e) => update('content', e.target.value)}
              className={textareaClass}
            />
          </div>
        );
      }
      case 'cta': {
        const p = payload as CtaBlockPayload;
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={(p.title ?? '') as string}
                onChange={(e) => update('title', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                type="text"
                value={(p.subtitle ?? '') as string}
                onChange={(e) => update('subtitle', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary CTA text</label>
              <input
                type="text"
                value={(p.primaryCtaText ?? '') as string}
                onChange={(e) => update('primaryCtaText', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Primary CTA href</label>
              <input
                type="text"
                value={(p.primaryCtaHref ?? '') as string}
                onChange={(e) => update('primaryCtaHref', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );
      }
      case 'faq': {
        const p = payload as FaqBlockPayload;
        const items = Array.isArray(p.items) ? p.items : [];
        return (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Section title</label>
              <input
                type="text"
                value={(p.title ?? '') as string}
                onChange={(e) => update('title', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                value={(p.description ?? '') as string}
                onChange={(e) => update('description', e.target.value)}
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>FAQ items (question / answer)</label>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                JSON array of objects with question and answer keys.
              </p>
              <textarea
                rows={6}
                value={JSON.stringify(items, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed)) update('items', parsed);
                  } catch {
                    // ignore invalid JSON while typing
                  }
                }}
                className={`${textareaClass} font-mono text-xs`}
              />
            </div>
          </div>
        );
      }
      case 'features': {
        const p = payload as FeaturesBlockPayload;
        const items = Array.isArray(p.items) ? p.items : [];
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Section title</label>
              <input type="text" value={(p.title ?? '') as string} onChange={(e) => update('title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input type="text" value={(p.subtitle ?? '') as string} onChange={(e) => update('subtitle', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Features</label>
              {items.map((item, i) => (
                <div key={i} className="mt-2 rounded border border-slate-200 p-3 dark:border-slate-700">
                  <input type="text" placeholder="Icon (e.g. star, shield)" value={item.icon ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], icon: e.target.value }; update('items', next); }} className={inputClass} />
                  <input type="text" placeholder="Title" value={item.title ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], title: e.target.value }; update('items', next); }} className={`${inputClass} mt-2`} />
                  <textarea placeholder="Description" rows={2} value={item.description ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], description: e.target.value }; update('items', next); }} className={`${textareaClass} mt-2`} />
                  <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} className="mt-2 text-xs text-rose-600 hover:underline">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => update('items', [...items, { title: '', description: '' }])} className="mt-2 text-xs font-medium text-primary-blue hover:underline">+ Add feature</button>
            </div>
          </div>
        );
      }
      case 'stats': {
        const p = payload as StatsBlockPayload;
        const items = Array.isArray(p.items) ? p.items : [];
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Section title</label>
              <input type="text" value={(p.title ?? '') as string} onChange={(e) => update('title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input type="text" value={(p.subtitle ?? '') as string} onChange={(e) => update('subtitle', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Stats</label>
              {items.map((item, i) => (
                <div key={i} className="mt-2 flex gap-2 rounded border border-slate-200 p-3 dark:border-slate-700">
                  <input type="text" placeholder="Value" value={item.value ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], value: e.target.value }; update('items', next); }} className={inputClass} />
                  <input type="text" placeholder="Label" value={item.label ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; update('items', next); }} className={inputClass} />
                  <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} className="text-xs text-rose-600 hover:underline shrink-0">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => update('items', [...items, { value: '', label: '' }])} className="mt-2 text-xs font-medium text-primary-blue hover:underline">+ Add stat</button>
            </div>
          </div>
        );
      }
      case 'team': {
        const p = payload as TeamBlockPayload;
        const items = Array.isArray(p.items) ? p.items : [];
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Section title</label>
              <input type="text" value={(p.title ?? '') as string} onChange={(e) => update('title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input type="text" value={(p.subtitle ?? '') as string} onChange={(e) => update('subtitle', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Team members</label>
              {items.map((item, i) => (
                <div key={i} className="mt-2 rounded border border-slate-200 p-3 dark:border-slate-700">
                  <input type="text" placeholder="Name" value={item.name ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], name: e.target.value }; update('items', next); }} className={inputClass} />
                  <input type="text" placeholder="Role" value={item.role ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], role: e.target.value }; update('items', next); }} className={`${inputClass} mt-2`} />
                  <input type="text" placeholder="Image URL" value={item.imageUrl ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], imageUrl: e.target.value }; update('items', next); }} className={`${inputClass} mt-2`} />
                  <textarea placeholder="Bio" rows={2} value={item.bio ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], bio: e.target.value }; update('items', next); }} className={`${textareaClass} mt-2`} />
                  <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} className="mt-2 text-xs text-rose-600 hover:underline">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => update('items', [...items, { name: '', role: '' }])} className="mt-2 text-xs font-medium text-primary-blue hover:underline">+ Add member</button>
            </div>
          </div>
        );
      }
      case 'testimonials': {
        const p = payload as TestimonialsBlockPayload;
        const items = Array.isArray(p.items) ? p.items : [];
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Section title</label>
              <input type="text" value={(p.title ?? '') as string} onChange={(e) => update('title', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input type="text" value={(p.subtitle ?? '') as string} onChange={(e) => update('subtitle', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Testimonials</label>
              {items.map((item, i) => (
                <div key={i} className="mt-2 rounded border border-slate-200 p-3 dark:border-slate-700">
                  <textarea placeholder="Quote" rows={3} value={item.quote ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], quote: e.target.value }; update('items', next); }} className={textareaClass} />
                  <input type="text" placeholder="Author name" value={item.authorName ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], authorName: e.target.value }; update('items', next); }} className={`${inputClass} mt-2`} />
                  <input type="text" placeholder="Author role" value={item.authorRole ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], authorRole: e.target.value }; update('items', next); }} className={`${inputClass} mt-2`} />
                  <input type="text" placeholder="Image URL" value={item.imageUrl ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], imageUrl: e.target.value }; update('items', next); }} className={`${inputClass} mt-2`} />
                  <button type="button" onClick={() => update('items', items.filter((_, j) => j !== i))} className="mt-2 text-xs text-rose-600 hover:underline">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => update('items', [...items, { quote: '', authorName: '' }])} className="mt-2 text-xs font-medium text-primary-blue hover:underline">+ Add testimonial</button>
            </div>
          </div>
        );
      }
      default:
        return (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Content editor for this block type is not yet available. Payload is stored as JSON.
            </p>
            <textarea
              rows={6}
              value={JSON.stringify(payload, null, 2)}
              onChange={(e) => {
                try {
                  setPayload(JSON.parse(e.target.value));
                } catch {
                  // ignore
                }
              }}
              className={`mt-2 w-full font-mono text-xs ${textareaClass}`}
            />
          </div>
        );
    }
  };

  const typeLabel = BLOCK_TYPE_LABELS[block.type as keyof typeof BLOCK_TYPE_LABELS] ?? block.type;

  const visibilitySection = (
    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Visibility (optional)
      </h4>
      <div className="mt-2 space-y-2">
        <div>
          <label className={labelClass}>Visible from (date)</label>
          <input
            type="datetime-local"
            value={meta.visibleFrom ?? ''}
            onChange={(e) => setMeta((m) => ({ ...m, visibleFrom: e.target.value || undefined }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Visible until (date)</label>
          <input
            type="datetime-local"
            value={meta.visibleUntil ?? ''}
            onChange={(e) => setMeta((m) => ({ ...m, visibleUntil: e.target.value || undefined }))}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={meta.hideOnMobile === true}
            onChange={(e) => setMeta((m) => ({ ...m, hideOnMobile: e.target.checked || undefined }))}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className={labelClass}>Hide on mobile</span>
        </label>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${typeLabel} block`}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="bordered" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {renderForm()}
        {visibilitySection}
      </div>
    </BaseModal>
  );
}
