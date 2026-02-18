<?php

namespace App\Observers;

use App\Models\SiteSetting;
use App\Support\Revalidation\RevalidateTag;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

class SiteSettingObserver
{
    public function saved(SiteSetting $siteSetting): void
    {
        $this->flushCaches();
    }

    public function deleted(SiteSetting $siteSetting): void
    {
        $this->flushCaches();
    }

    protected function flushCaches(): void
    {
        if (Cache::getStore() instanceof TaggableStore) {
            Cache::tags(['site-settings'])->flush();
        } else {
            Cache::forget('site-settings');
        }

        RevalidateTag::dispatch('site-settings');
    }
}


