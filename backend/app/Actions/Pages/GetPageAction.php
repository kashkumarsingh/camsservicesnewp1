<?php

namespace App\Actions\Pages;

use App\Models\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Cache\TaggableStore;

/**
 * Get page action.
 */
class GetPageAction
{
    public function execute(string $slug): Page
    {
        $store = Cache::getStore();
        $cacheKey = "page:{$slug}";

        if ($store instanceof TaggableStore) {
            return Cache::tags(['pages', "page:{$slug}"])->remember(
                $cacheKey,
                now()->addMinutes(30),
                fn () => $this->fetchPage($slug)
            );
        }

        return Cache::remember(
            $cacheKey,
            now()->addMinutes(30),
            fn () => $this->fetchPage($slug)
        );
    }

    /**
     * Get all published pages.
     *
     * @param array<string, mixed> $filters
     * @return \Illuminate\Database\Eloquent\Collection<int, Page>
     */
    public function getAll(array $filters = [])
    {
        $query = Page::query()->published();
        return $query->orderByDesc('updated_at')->get();
    }

    /**
     * Fetch page for public view.
     */
    private function fetchPage(string $slug): Page
    {
        return Page::where('slug', $slug)
            ->published()
            ->firstOrFail();
    }

    /**
     * Fetch page for admin preview (any status).
     */
    public function executeForPreview(string $slug): Page
    {
        return Page::where('slug', $slug)
            ->firstOrFail();
    }
}
