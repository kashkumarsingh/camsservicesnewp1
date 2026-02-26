<?php

namespace App\Actions\Pages;

use App\Models\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Cache\TaggableStore;

/**
 * Get Page Action (Application Layer)
 * 
 * This is part of the Application layer in Clean Architecture.
 * Contains use case logic for retrieving a page by slug.
 */
class GetPageAction
{
    /**
     * Execute the action to get a page by slug.
     *
     * @param string $slug
     * @param bool $incrementViews
     * @return Page
     * @throws ModelNotFoundException
     */
    public function execute(string $slug, bool $incrementViews = false): Page
    {
        $store = Cache::getStore();

        if ($incrementViews) {
            $page = $this->fetchPage($slug);
            $page->incrementViews();

            if ($store instanceof TaggableStore) {
                Cache::tags(["page:{$slug}"])->flush();
                Cache::tags(['pages'])->flush();
            } else {
                Cache::forget("page:{$slug}");
                Cache::forget('pages');
            }

            return $page->fresh();
        }

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
     * @param array $filters
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAll(array $filters = [])
    {
        $query = Page::query()->published();

        if (isset($filters['type'])) {
            $query->ofType($filters['type']);
        }

        return $query->orderBy('updated_at', 'desc')->get();
    }

    private function fetchPage(string $slug): Page
    {
        return Page::where('slug', $slug)
            ->published()
            ->with(['blocks' => fn ($q) => $q->orderBy('sort_order')])
            ->firstOrFail();
    }
}

