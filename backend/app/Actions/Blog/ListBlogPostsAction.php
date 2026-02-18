<?php

namespace App\Actions\Blog;

use App\Models\BlogPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListBlogPostsAction
{
    /**
     * Execute the action to list blog posts with filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function execute(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = BlogPost::query()
            ->with(['category', 'tags'])
            ->published();

        if (!empty($filters['category'])) {
            $query->whereHas('category', function ($builder) use ($filters) {
                $builder->where('slug', $filters['category']);
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['tag'])) {
            $query->whereHas('tags', function ($builder) use ($filters) {
                $builder->where('slug', $filters['tag']);
            });
        }

        if (!empty($filters['tag_id'])) {
            $query->whereHas('tags', function ($builder) use ($filters) {
                $builder->where('blog_tags.id', $filters['tag_id']);
            });
        }

        if (!empty($filters['featured'])) {
            $query->featured();
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? 'published_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        return $query->orderBy($sortBy, $sortOrder)
            ->paginate($perPage)
            ->appends($filters);
    }
}

