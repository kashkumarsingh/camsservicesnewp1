<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Services\GetServiceAction;
use App\Actions\Services\ListServicesAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Service Controller
 *
 * Clean Architecture Layer: Interface (API Adapter)
 * Purpose: Expose services via REST endpoints with camelCase responses.
 */
class ServiceController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListServicesAction $listServicesAction,
        private readonly GetServiceAction $getServiceAction,
    ) {
    }

    /**
     * GET /api/v1/services
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $this->validateFilters($request);

        $services = $this->listServicesAction->execute($filters);

        if ($services instanceof LengthAwarePaginator) {
            // Format services
            $formattedServices = $services->getCollection()->map(fn ($service) => $this->formatService($service));

            // Create new paginator with formatted data
            $formattedPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
                $formattedServices,
                $services->total(),
                $services->perPage(),
                $services->currentPage(),
                ['path' => $request->url(), 'query' => $request->query()]
            );

            return $this->paginatedResponse($formattedPaginator);
        }

        /** @var Collection $services */
        return $this->collectionResponse(
            $services->map(fn ($service) => $this->formatService($service))
        );
    }

    /**
     * GET /api/v1/services/{slug}
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        try {
            $increment = $request->boolean('increment_views', false);
            $service = $this->getServiceAction->execute($slug, $increment);

            return $this->successResponse($this->formatService($service));
        } catch (\Throwable $e) {
            return $this->notFoundResponse('Service');
        }
    }

    /**
     * Validate query filters.
     *
     * @throws ValidationException
     */
    private function validateFilters(Request $request): array
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:80'],
            'search' => ['nullable', 'string', 'max:160'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort' => ['nullable', 'in:title,created_at,updated_at,views'],
            'direction' => ['nullable', 'in:asc,desc'],
            'published' => ['nullable', 'boolean'],
        ]);

        return [
            'category' => $validated['category'] ?? null,
            'search' => $validated['search'] ?? null,
            'paginate' => $validated['per_page'] ?? null,
            'sort' => $validated['sort'] ?? 'title',
            'direction' => $validated['direction'] ?? 'asc',
            'published' => array_key_exists('published', $validated) ? (bool) $validated['published'] : null,
        ];
    }

    /**
     * Format response payload.
     */
    private function formatService($service): array
    {
        return [
            'id' => (string) $service->id,
            'title' => $service->title,
            'slug' => $service->slug,
            'summary' => $service->summary,
            'description' => $service->description,
            'body' => $service->body,
            'icon' => $service->icon,
            'category' => $service->category,
            'views' => (int) $service->views,
            'published' => (bool) $service->published,
            'publishAt' => $service->publish_at?->toIso8601String(),
            'createdAt' => $service->created_at?->toIso8601String(),
            'updatedAt' => $service->updated_at?->toIso8601String(),
        ];
    }
}


