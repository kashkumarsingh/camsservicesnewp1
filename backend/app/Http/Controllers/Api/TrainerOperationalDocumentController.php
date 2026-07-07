<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\OperationalDocument;
use App\Services\Compliance\OperationalDocumentFileResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Trainer operational documents: list and download published internal resources.
 */
class TrainerOperationalDocumentController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly OperationalDocumentFileResolver $documentFiles
    ) {}

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
    public function download(Request $request, int $id): JsonResponse|StreamedResponse|BinaryFileResponse|RedirectResponse
    {
        $document = OperationalDocument::find($id);
        if (! $document || ! $document->visibleToTrainer()) {
            return $this->notFoundResponse('Document');
        }

        $response = $this->documentFiles->downloadResponse($document);
        if ($response === null) {
            return $this->notFoundResponse('Document file');
        }

        return $response;
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
            'external_url' => $doc->external_url,
            'has_download' => $this->documentFiles->hasDownloadableFile($doc),
            'version' => $doc->version,
            'updated_at' => $doc->updated_at?->toIso8601String(),
        ];
    }
}
