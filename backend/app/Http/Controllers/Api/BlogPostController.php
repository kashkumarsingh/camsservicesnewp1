<?php

namespace App\Http\Controllers\Api;

use App\Actions\Blog\GetBlogPostAction;
use App\Actions\Blog\ListBlogPostsAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListBlogPostsAction $listBlogPostsAction,
        private readonly GetBlogPostAction $getBlogPostAction,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'category',
            'category_id',
            'tag',
            'tag_id',
            'search',
            'featured',
            'sort_by',
            'sort_order',
        ]);

        $perPage = (int) $request->integer('limit', 9);
        $perPage = max(3, min($perPage, 24));

        $paginator = $this->listBlogPostsAction->execute($filters, $perPage);

        // Format posts
        $formattedPosts = $paginator->getCollection()->map(fn ($post) => $this->formatPost($post));

        // Create new paginator with formatted data
        $formattedPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $formattedPosts,
            $paginator->total(),
            $paginator->perPage(),
            $paginator->currentPage(),
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return $this->paginatedResponse($formattedPaginator);
    }

    public function show(string $slug): JsonResponse
    {
        try {
            $post = $this->getBlogPostAction->execute($slug);

            $post->incrementViews();

            $response = $this->successResponse($this->formatPost($post));

            // Set ETag based on post updated_at for cache invalidation
            $response->setEtag(md5($post->id . $post->updated_at?->timestamp));

            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $exception) {
            return $this->notFoundResponse('Blog post');
        }
    }

    private function formatPost($post): array
    {
        return [
            'id' => (string) $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'content' => $post->content,
            'heroImage' => $post->hero_image,
            'author' => [
                'name' => $post->author_name,
                'role' => $post->author_role,
                'avatarUrl' => $post->author_avatar_url,
            ],
            'category' => $post->category ? [
                'id' => (string) $post->category->id,
                'name' => $post->category->name,
                'slug' => $post->category->slug,
            ] : null,
            'tags' => $post->tags->map(fn ($tag) => [
                'id' => (string) $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ]),
            'isFeatured' => (bool) $post->is_featured,
            'publishedAt' => optional($post->published_at)->toIso8601String(),
            'readingTime' => $post->reading_time,
            'views' => $post->views,
            'seo' => $post->seo ?? [],
            'heroMetadata' => $post->hero_metadata ?? [],
            'structuredContent' => $post->structured_content ?? [],
            'createdAt' => optional($post->created_at)->toIso8601String(),
            'updatedAt' => optional($post->updated_at)->toIso8601String(),
        ];
    }
}

