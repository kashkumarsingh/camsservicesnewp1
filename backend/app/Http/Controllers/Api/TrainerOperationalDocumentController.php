<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\OperationalDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Trainer operational documents: list and download published internal resources.
 */
class TrainerOperationalDocumentController extends Controller
{
    use BaseApiController;

    private const DISK = 'local';

    /**
     * GET /api/v1/trainer/operational-documents
     */
    public function index(Request $request): JsonResponse
    {
        $documents = OperationalDocument::query()
            ->where('is_published', true)
            ->where('internal_only', true)
            ->whereIn('audience', [
                OperationalDocument::AUDIENCE_TRAINER,
                OperationalDocument::AUDIENCE_ALL,
            ])
            ->orderBy('title')
            ->get()
            ->map(fn (OperationalDocument $doc) => $this->formatDocument($doc));

        return $this->successResponse(['documents' => $documents]);
    }

    /**
     * GET /api/v1/trainer/operational-documents/{id}/download
     */
    public function download(Request $request, int $id): JsonResponse|StreamedResponse
    {
        $document = OperationalDocument::find($id);
        if (! $document || ! $document->visibleToTrainer()) {
            return $this->notFoundResponse('Document');
        }

        if (! $document->storage_path || ! Storage::disk(self::DISK)->exists($document->storage_path)) {
            return $this->notFoundResponse('Document file');
        }

        $mime = Storage::disk(self::DISK)->mimeType($document->storage_path) ?: $document->mime_type;

        return Storage::disk(self::DISK)->response(
            $document->storage_path,
            $document->file_name,
            ['Content-Type' => $mime]
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function formatDocument(OperationalDocument $doc): array
    {
        return [
            'id' => $doc->id,
            'slug' => $doc->slug,
            'title' => $doc->title,
            'category' => $doc->category,
            'audience' => $doc->audience,
            'file_name' => $doc->file_name,
            'version' => $doc->version,
            'updated_at' => $doc->updated_at?->toIso8601String(),
        ];
    }
}
