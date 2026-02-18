<?php

declare(strict_types=1);

namespace App\Actions\SiteSettings;

use App\Models\SiteSetting;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

/**
 * Get Site Settings Action
 * 
 * Clean Architecture Layer: Application (Use Case)
 * 
 * Fetches site settings (singleton pattern - returns first or creates default).
 */
class GetSiteSettingsAction
{
    /**
     * Execute the action.
     *
     * @return SiteSetting
     */
    public function execute(): SiteSetting
    {
        $cacheKey = 'site-settings';
        $callback = static fn () => SiteSetting::instance()->fresh();

        if (Cache::getStore() instanceof TaggableStore) {
            return Cache::tags(['site-settings'])->remember(
                $cacheKey,
                now()->addMinutes(30),
                $callback
            );
        }

        return Cache::remember(
            $cacheKey,
            now()->addMinutes(30),
            $callback
        );
    }
}

