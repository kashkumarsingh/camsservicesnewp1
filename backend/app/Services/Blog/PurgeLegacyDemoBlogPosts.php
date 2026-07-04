<?php

namespace App\Services\Blog;

use App\Models\BlogPost;
use App\Support\Blog\LegacyDemoBlogSlugs;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PurgeLegacyDemoBlogPosts
{
    /**
     * @return Collection<int, string> Deleted post slugs
     */
    public function execute(): Collection
    {
        if (! $this->blogPostsTableExists()) {
            return collect();
        }

        $posts = BlogPost::withTrashed()
            ->with('tags')
            ->where(fn (Builder $query) => $this->applyLegacyDemoScope($query))
            ->get();

        if ($posts->isEmpty()) {
            return collect();
        }

        $deletedSlugs = DB::transaction(function () use ($posts): Collection {
            return $posts->map(function (BlogPost $post): string {
                $slug = $post->slug;
                $post->tags()->detach();
                $post->forceDelete();

                return $slug;
            });
        });

        return $deletedSlugs->values();
    }

    public function applyLegacyDemoScope(Builder $query): Builder
    {
        return $query->where(function (Builder $builder): void {
            $builder->whereIn('slug', LegacyDemoBlogSlugs::EXACT)
                ->orWhere('slug', 'like', LegacyDemoBlogSlugs::PREFIX.'%')
                ->orWhere('title', 'like', LegacyDemoBlogSlugs::TITLE_PREFIX.'%');
        });
    }

    private function blogPostsTableExists(): bool
    {
        return DB::getSchemaBuilder()->hasTable('blog_posts');
    }
}
