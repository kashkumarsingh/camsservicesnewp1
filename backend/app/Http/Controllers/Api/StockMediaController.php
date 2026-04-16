<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Services\Media\StockMediaSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMediaController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly StockMediaSearchService $stockMediaSearchService
    ) {
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2', 'max:120'],
            'type' => ['nullable', 'in:image,video'],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:24'],
            'page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = (string) $validated['query'];
        $type = (string) ($validated['type'] ?? 'image');
        $perPage = (int) ($validated['perPage'] ?? 12);
        $page = (int) ($validated['page'] ?? 1);

        $items = $this->stockMediaSearchService->search($query, $type, $perPage, $page);

        return $this->successResponse([
            'query' => $query,
            'type' => $type,
            'items' => $items,
        ]);
    }
}

