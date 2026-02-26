'use client';

import React, { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import type { AdminPageBlockDTO, PageBlockMetaDTO } from '@/core/application/pages/dto/PageDTO';
import { BLOCK_TYPE_LABELS, PAGE_BLOCK_TYPES, type PageBlockType } from '@/utils/pageBuilderConstants';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { ROUTES } from '@/utils/routes';
import { BlockEditModal } from './BlockEditModal';
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, ExternalLink, Copy } from 'lucide-react';
import { toastManager } from '@/utils/toast';

interface PageBlocksEditorProps {
  pageId: string;
  slug: string;
  blocks: AdminPageBlockDTO[];
  onCreateBlock: (
    pageId: string,
    data: { type: string; payload?: Record<string, unknown>; meta?: PageBlockMetaDTO | null }
  ) => Promise<AdminPageBlockDTO>;
  onUpdateBlock: (
    pageId: string,
    blockId: string,
    data: { payload?: Record<string, unknown>; meta?: PageBlockMetaDTO | null }
  ) => Promise<AdminPageBlockDTO>;
  onDeleteBlock: (pageId: string, blockId: string) => Promise<void>;
  onReorderBlocks: (pageId: string, blockIds: string[]) => Promise<AdminPageBlockDTO[]>;
  onBlocksChanged: () => void;
}

const DEFAULT_PAYLOAD_BY_TYPE: Partial<Record<PageBlockType, Record<string, unknown>>> = {
  hero: {},
  rich_text: { content: '' },
  cta: {},
  faq: { items: [] },
  features: { title: '', subtitle: '', items: [] },
  testimonials: { title: '', subtitle: '', items: [] },
  stats: { title: '', subtitle: '', items: [] },
  team: { title: '', subtitle: '', items: [] },
};

export function PageBlocksEditor({
  pageId,
  slug,
  blocks,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  onBlocksChanged,
}: PageBlocksEditorProps) {
  const [editingBlock, setEditingBlock] = useState<AdminPageBlockDTO | null>(null);
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleMove = useCallback(
    async (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;
      const reordered = [...blocks];
      const a = reordered[index];
      reordered[index] = reordered[newIndex];
      reordered[newIndex] = a;
      const blockIds = reordered.map((b) => b.id);
      setBusy(true);
      try {
        await onReorderBlocks(pageId, blockIds);
        onBlocksChanged();
      } catch (err) {
        toastManager.error(err instanceof Error ? err.message : 'Failed to reorder');
      } finally {
        setBusy(false);
      }
    },
    [blocks, pageId, onReorderBlocks, onBlocksChanged]
  );

  const handleDelete = useCallback(
    async (block: AdminPageBlockDTO) => {
      if (!confirm(`Delete this ${BLOCK_TYPE_LABELS[block.type as PageBlockType] ?? block.type} block? This cannot be undone.`)) return;
      setBusy(true);
      try {
        await onDeleteBlock(pageId, block.id);
        onBlocksChanged();
        toastManager.success('Block deleted');
      } catch (err) {
        toastManager.error(err instanceof Error ? err.message : 'Failed to delete block');
      } finally {
        setBusy(false);
      }
    },
    [pageId, onDeleteBlock, onBlocksChanged]
  );

  const handleAddBlock = useCallback(
    async (type: string) => {
      setAddBlockOpen(false);
      const payload = DEFAULT_PAYLOAD_BY_TYPE[type as PageBlockType] ?? {};
      setBusy(true);
      try {
        await onCreateBlock(pageId, { type, payload });
        onBlocksChanged();
        toastManager.success('Block added');
      } catch (err) {
        toastManager.error(err instanceof Error ? err.message : 'Failed to add block');
      } finally {
        setBusy(false);
      }
    },
    [pageId, onCreateBlock, onBlocksChanged]
  );

  const handleDuplicateBlock = useCallback(
    async (block: AdminPageBlockDTO) => {
      setBusy(true);
      try {
        await onCreateBlock(pageId, {
          type: block.type,
          payload: block.payload ?? {},
          meta: block.meta ?? undefined,
        });
        onBlocksChanged();
        toastManager.success('Block duplicated');
      } catch (err) {
        toastManager.error(err instanceof Error ? err.message : 'Failed to duplicate block');
      } finally {
        setBusy(false);
      }
    },
    [pageId, onCreateBlock, onBlocksChanged]
  );

  const handleSaveBlock = useCallback(
    async (payload: Record<string, unknown>, meta?: PageBlockMetaDTO | null) => {
      if (!editingBlock) return;
      await onUpdateBlock(pageId, editingBlock.id, { payload, meta });
      onBlocksChanged();
      setEditingBlock(null);
      toastManager.success('Block updated');
    },
    [editingBlock, pageId, onUpdateBlock, onBlocksChanged]
  );

  const previewUrl = slug ? ROUTES.PAGE_BY_SLUG(slug) : null;

  return (
    <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Page blocks
        </h3>
        <div className="flex items-center gap-2">
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Preview
            </a>
          )}
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => setAddBlockOpen((v) => !v)}
              disabled={busy}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add block
            </Button>
            {addBlockOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setAddBlockOpen(false)}
                />
                <ul
                  className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  role="listbox"
                >
                  {PAGE_BLOCK_TYPES.map((type) => (
                    <li key={type}>
                      <button
                        type="button"
                        role="option"
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => handleAddBlock(type)}
                      >
                        {BLOCK_TYPE_LABELS[type]}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center dark:border-slate-700 dark:bg-slate-900/30">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {EMPTY_STATE.NO_BLOCKS_YET.title}
          </p>
          <p className="mt-1 text-2xs text-slate-500 dark:text-slate-500">
            {EMPTY_STATE.NO_BLOCKS_YET.message}
          </p>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="mt-3"
            onClick={() => setAddBlockOpen(true)}
            disabled={busy}
          >
            Add first block
          </Button>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white py-2 pl-2 pr-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Move block up"
                  disabled={index === 0 || busy}
                  onClick={() => handleMove(index, 'up')}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move block down"
                  disabled={index === blocks.length - 1 || busy}
                  onClick={() => handleMove(index, 'down')}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <span className="min-w-[80px] flex-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                {BLOCK_TYPE_LABELS[block.type as PageBlockType] ?? block.type}
              </span>
              <div className="flex flex-shrink-0 gap-1">
                <button
                  type="button"
                  aria-label="Duplicate block"
                  title="Duplicate block"
                  onClick={() => handleDuplicateBlock(block)}
                  disabled={busy}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Edit block"
                  title="Edit block"
                  onClick={() => setEditingBlock(block)}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Delete block"
                  title="Delete block"
                  onClick={() => handleDelete(block)}
                  disabled={busy}
                  className="rounded p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingBlock && (
        <BlockEditModal
          isOpen={!!editingBlock}
          onClose={() => setEditingBlock(null)}
          block={editingBlock}
          onSave={handleSaveBlock}
        />
      )}
    </div>
  );
}
