<?php

namespace App\Actions\Blog;

use App\Models\BlogPost;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class GetBlogPostAction
{
    /**
     * Execute the action to fetch a single published blog post by slug.
     *
     * @param string $slug
     * @return BlogPost
     *
     * @throws ModelNotFoundException
     */
    public function execute(string $slug): BlogPost
    {
        return BlogPost::query()
            ->with(['category', 'tags'])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();
    }
}

