<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Admin Page Blocks Controller (Interface Layer - API)
 *
 * CRUD and reorder for page_blocks. Nested under admin/public-pages/{id}/blocks.
 * All responses camelCase. PageBlockObserver handles cache revalidation on save/delete.
 */
class AdminPageBlocksController extends Controller
{
    use BaseApiController;

    /**
     * Format a block for API (camelCase).
     * Phase 5: include meta for visibility/scheduling.
     *
     * @return array{id: string, sortOrder: int, type: string, payload: array, meta: array|null}
     */
    private function formatBlock(PageBlock $block): array
    {
        return [
            'id' => (string) $block->id,
            'sortOrder' => (int) $block->sort_order,
            'type' => $block->type,
            'payload' => $block->payload ?? [],
            'meta' => $block->meta ?? null,
        ];
    }

    /**
     * List blocks for a page.
     */
    public function index(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $page->load('blocks');
        $blocks = $page->blocks->map(fn (PageBlock $b) => $this->formatBlock($b))->values()->all();

        return $this->collectionResponse($blocks);
    }

    /**
     * Create a new block.
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $allowedTypes = PageBlock::allowedTypes();

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in($allowedTypes)],
            'payload' => 'nullable|array',
            'meta' => 'nullable|array',
            'meta.visibleFrom' => 'nullable|string|date',
            'meta.visibleUntil' => 'nullable|string|date',
            'meta.hideOnMobile' => 'nullable|boolean',
        ]);

        $maxOrder = (int) $page->blocks()->max('sort_order');
        $block = $page->blocks()->create([
            'type' => $validated['type'],
            'payload' => $validated['payload'] ?? [],
            'meta' => $validated['meta'] ?? null,
            'sort_order' => $maxOrder + 1,
        ]);

        return $this->itemResponse($this->formatBlock($block->fresh()), 201);
    }

    /**
     * Update a block.
     */
    public function update(Request $request, int $id, int $blockId): JsonResponse
    {
        $block = PageBlock::where('page_id', $id)->findOrFail($blockId);
        $allowedTypes = PageBlock::allowedTypes();

        $validated = $request->validate([
            'type' => ['sometimes', 'string', Rule::in($allowedTypes)],
            'payload' => 'nullable|array',
            'meta' => 'nullable|array',
            'meta.visibleFrom' => 'nullable|string|date',
            'meta.visibleUntil' => 'nullable|string|date',
            'meta.hideOnMobile' => 'nullable|boolean',
        ]);

        if (array_key_exists('type', $validated)) {
            $block->type = $validated['type'];
        }
        if (array_key_exists('payload', $validated)) {
            $block->payload = $validated['payload'];
        }
        if (array_key_exists('meta', $validated)) {
            $block->meta = $validated['meta'];
        }
        $block->save();

        return $this->itemResponse($this->formatBlock($block->fresh()));
    }

    /**
     * Delete a block.
     */
    public function destroy(int $id, int $blockId): JsonResponse
    {
        $block = PageBlock::where('page_id', $id)->findOrFail($blockId);
        $block->delete();

        return $this->emptyResponse(204);
    }

    /**
     * Reorder blocks. Body: { "blockIds": [ "1", "2", "3" ] } (ordered ids).
     */
    public function reorder(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $validated = $request->validate([
            'blockIds' => 'required|array',
            'blockIds.*' => 'integer|exists:page_blocks,id',
        ]);

        $blockIds = $validated['blockIds'];
        $pageBlocks = $page->blocks()->whereIn('id', $blockIds)->get()->keyBy('id');
        if (count($pageBlocks) !== count($blockIds)) {
            return $this->errorResponse('All block IDs must belong to this page.', 'invalid_block_ids', [], 422);
        }

        foreach ($blockIds as $index => $blockId) {
            $block = $pageBlocks->get($blockId);
            if ($block) {
                $block->update(['sort_order' => $index]);
            }
        }

        $page->load('blocks');
        $blocks = $page->blocks->map(fn (PageBlock $b) => $this->formatBlock($b))->values()->all();

        return $this->collectionResponse($blocks);
    }
}
