<?php

namespace App\Observers;

use App\Models\PageBlock;
use App\Support\Revalidation\RevalidateTag;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

/**
 * When a page block is saved or deleted, flush caches and revalidate the parent page.
 *
 * @see PAGE_BUILDER_PHASE_PLAN.md
 */
class PageBlockObserver
{
    public function saved(PageBlock $block): void
    {
        $this->revalidatePage($block);
    }

    public function deleted(PageBlock $block): void
    {
        $this->revalidatePage($block);
    }

    private function revalidatePage(PageBlock $block): void
    {
        $page = $block->page;
        if (! $page) {
            return;
        }

        if (Cache::getStore() instanceof TaggableStore) {
            Cache::tags(['pages'])->flush();
            Cache::tags(["page:{$page->slug}"])->flush();
        } else {
            Cache::forget('pages');
            Cache::forget("page:{$page->slug}");
        }

        RevalidateTag::dispatch('pages');
        RevalidateTag::dispatch("page:{$page->slug}");
    }
}
