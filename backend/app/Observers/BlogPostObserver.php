<?php

namespace App\Observers;

use App\Models\BlogPost;
use App\Support\Revalidation\RevalidateTag;
use Illuminate\Cache\TaggableStore;
use Illuminate\Support\Facades\Cache;

class BlogPostObserver
{
    public function saved(BlogPost $post): void
    {
        $ignoredChanges = ['views', 'updated_at'];
        $changeKeys = array_diff(array_keys($post->getChanges()), $ignoredChanges);

        if (!$post->wasRecentlyCreated && empty($changeKeys)) {
            return;
        }

        $this->flushCaches($post);
    }

    public function deleted(BlogPost $post): void
    {
        $this->flushCaches($post);
    }

    protected function flushCaches(BlogPost $post): void
    {
        $store = Cache::getStore();

        if ($store instanceof TaggableStore) {
            Cache::tags(['blog-posts'])->flush();
            Cache::tags(["blog-post:{$post->slug}"])->flush();
        } else {
            Cache::forget('blog-posts');
            Cache::forget("blog-post:{$post->slug}");
        }

        RevalidateTag::dispatch('blog-posts');
        RevalidateTag::dispatch("blog-post:{$post->slug}");
    }
}

