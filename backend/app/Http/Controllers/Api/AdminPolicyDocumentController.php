<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Revalidation\RevalidateTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Admin Policy Document Controller
 *
 * Content management for individual policy pages (Cancellation, Privacy, etc.).
 * GET/PUT by slug; stores body + metadata in page.content as { body, lastUpdated, effectiveDate, version }.
 */
class AdminPolicyDocumentController extends Controller
{
    use BaseApiController;

    /** Allowed slugs for policy document editing. */
    private const ALLOWED_SLUGS = [
        'cancellation-policy',
        'cookie-policy',
        'payment-refund-policy',
        'privacy-policy',
        'safeguarding-policy',
        'terms-of-service',
    ];

    private function isAllowedSlug(string $slug): bool
    {
        return in_array($slug, self::ALLOWED_SLUGS, true);
    }

    /**
     * GET /admin/policy-documents/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        if (! $this->isAllowedSlug($slug)) {
            return $this->errorResponse('Policy document not found.', 'invalid_slug', [], 404);
        }

        $page = Page::where('slug', $slug)->first();
        if (! $page) {
            return $this->successResponse($this->keysToCamelCase([
                'title' => Str::title(Str::replace('-', ' ', $slug)),
                'summary' => '',
                'content' => '',
                'lastUpdated' => null,
                'effectiveDate' => null,
                'version' => '1.0',
            ]));
        }

        $content = $page->content;
        if (! is_array($content)) {
            $content = [];
        }
        $body = $content['body'] ?? '';
        if (is_array($body)) {
            $body = '';
        }

        $payload = [
            'title' => $page->title ?? Str::title(Str::replace('-', ' ', $slug)),
            'summary' => $page->meta_description ?? '',
            'content' => (string) $body,
            'lastUpdated' => $content['lastUpdated'] ?? null,
            'effectiveDate' => $content['effectiveDate'] ?? null,
            'version' => $content['version'] ?? '1.0',
        ];

        return $this->successResponse($this->keysToCamelCase($payload));
    }

    /**
     * PUT /admin/policy-documents/{slug}
     */
    public function update(Request $request, string $slug): JsonResponse
    {
        if (! $this->isAllowedSlug($slug)) {
            return $this->errorResponse('Policy document not found.', 'invalid_slug', [], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:1000',
            'content' => 'nullable|string',
            'lastUpdated' => 'nullable|string|max:50',
            'effectiveDate' => 'nullable|string|max:50',
            'version' => 'nullable|string|max:50',
        ]);

        $contentBody = $request->input('content');
        if (! is_string($contentBody)) {
            $contentBody = '';
        }

        $page = Page::firstOrCreate(
            ['slug' => $slug],
            [
                'title' => $request->input('title'),
                'status' => Page::STATUS_PUBLISHED,
                'meta_title' => null,
                'meta_description' => $request->input('summary'),
                'content' => [
                    'body' => '',
                    'lastUpdated' => null,
                    'effectiveDate' => null,
                    'version' => '1.0',
                ],
            ]
        );

        $page->title = $request->input('title');
        $page->meta_description = $request->input('summary');
        $page->content = [
            'body' => $contentBody,
            'lastUpdated' => $request->input('lastUpdated'),
            'effectiveDate' => $request->input('effectiveDate'),
            'version' => $request->input('version', '1.0'),
        ];
        $page->save();

        RevalidateTag::dispatch('pages');
        RevalidateTag::dispatch("page:{$slug}");

        return $this->successResponse($this->keysToCamelCase([
            'title' => $page->title,
            'summary' => $page->meta_description,
            'content' => $page->content['body'] ?? '',
            'lastUpdated' => $page->content['lastUpdated'] ?? null,
            'effectiveDate' => $page->content['effectiveDate'] ?? null,
            'version' => $page->content['version'] ?? '1.0',
        ]));
    }
}
