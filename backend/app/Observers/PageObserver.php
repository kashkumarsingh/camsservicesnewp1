<?php

namespace App\Observers;

use App\Models\Page;
use App\Support\Revalidation\RevalidateTag;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

class PageObserver
{
    public function saved(Page $page): void
    {
        $this->flushCaches($page);
    }

    public function deleted(Page $page): void
    {
        $this->flushCaches($page);
    }

    protected function flushCaches(Page $page): void
    {
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


