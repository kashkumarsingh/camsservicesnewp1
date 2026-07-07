<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\OperationalDocument;
use App\Services\Compliance\OperationalDocumentFileResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin operational documents: upload, publish, and manage internal policy PDFs.
 */
class AdminOperationalDocumentController extends Controller
{
    use BaseApiController;

    private const DISK = 'local';

    public function __construct(
        private readonly OperationalDocumentFileResolver $documentFiles
    ) {}

    private const CATEGORIES = [
        OperationalDocument::CATEGORY_SAFEGUARDING,
        OperationalDocument::CATEGORY_TRANSPORT,
        OperationalDocument::CATEGORY_HR,
        OperationalDocument::CATEGORY_OPERATIONS,
        OperationalDocument::CATEGORY_LEGAL,
    ];

    private const AUDIENCES = [
        OperationalDocument::AUDIENCE_TRAINER,
        OperationalDocument::AUDIENCE_ADMIN,
        OperationalDocument::AUDIENCE_ALL,
    ];

    /**
     * GET /api/v1/admin/operational-documents
     */
    public function index(Request $request): JsonResponse
    {
        $query = OperationalDocument::query()->with('uploadedBy:id,name')->orderBy('title');

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($request->query('published') === '1') {
            $query->where('is_published', true);
        } elseif ($request->query('published') === '0') {
            $query->where('is_published', false);
        }

        $documents = $query->get()->map(fn (OperationalDocument $doc) => $this->formatDocument($doc));

        return $this->successResponse(['documents' => $documents]);
    }

    /**
     * POST /api/v1/admin/operational-documents
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:operational_documents,slug'],
            'category' => ['required', 'string', Rule::in(self::CATEGORIES)],
            'audience' => ['required', 'string', Rule::in(self::AUDIENCES)],
            'version' => ['sometimes', 'nullable', 'string', 'max:20'],
            'is_published' => ['sometimes', 'boolean'],
            'internal_only' => ['sometimes', 'boolean'],
            'external_url' => ['sometimes', 'nullable', 'string', 'url', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        try {
            $slug = $request->input('slug') ?: Str::slug($request->input('title'));
            if (OperationalDocument::where('slug', $slug)->exists()) {
                $slug = $slug.'-'.Str::lower(Str::random(4));
            }

            $uploaded = $request->file('file');
            $extension = $uploaded->getClientOriginalExtension() ?: 'pdf';
            $storagePath = $uploaded->storeAs(
                'operational-documents',
                $slug.'.'.$extension,
                self::DISK
            );

            $document = OperationalDocument::create([
                'slug' => $slug,
                'title' => $request->input('title'),
                'category' => $request->input('category'),
                'audience' => $request->input('audience'),
                'storage_path' => $storagePath,
                'file_name' => $uploaded->getClientOriginalName(),
                'mime_type' => $uploaded->getMimeType() ?: 'application/octet-stream',
                'version' => $request->input('version', '1.0'),
                'is_published' => $request->boolean('is_published', false),
                'internal_only' => $request->boolean('internal_only', true),
                'external_url' => $request->input('external_url'),
                'uploaded_by' => $request->user()?->id,
            ]);

            $document->load('uploadedBy:id,name');

            return $this->successResponse(
                ['document' => $this->formatDocument($document)],
                'Document uploaded successfully.',
                [],
                201
            );
        } catch (\Exception $e) {
            Log::error('Error uploading operational document', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse('Failed to upload document.');
        }
    }

    /**
     * PUT /api/v1/admin/operational-documents/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $document = OperationalDocument::find($id);
        if (! $document) {
            return $this->notFoundResponse('Document');
        }

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', Rule::in(self::CATEGORIES)],
            'audience' => ['sometimes', 'string', Rule::in(self::AUDIENCES)],
            'version' => ['sometimes', 'nullable', 'string', 'max:20'],
            'is_published' => ['sometimes', 'boolean'],
            'internal_only' => ['sometimes', 'boolean'],
            'external_url' => ['sometimes', 'nullable', 'string', 'url', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $document->fill($request->only([
            'title',
            'category',
            'audience',
            'version',
            'is_published',
            'internal_only',
            'external_url',
        ]));
        $document->save();
        $document->load('uploadedBy:id,name');

        return $this->successResponse(
            ['document' => $this->formatDocument($document)],
            'Document updated successfully.'
        );
    }

    /**
     * DELETE /api/v1/admin/operational-documents/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $document = OperationalDocument::find($id);
        if (! $document) {
            return $this->notFoundResponse('Document');
        }

        try {
            if ($document->storage_path && Storage::disk(self::DISK)->exists($document->storage_path)) {
                Storage::disk(self::DISK)->delete($document->storage_path);
            }
            $document->delete();

            return $this->successResponse(null, 'Document deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting operational document', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to delete document.');
        }
    }

    /**
     * GET /api/v1/admin/operational-documents/{id}/download
     */
    public function download(Request $request, int $id): JsonResponse|StreamedResponse|BinaryFileResponse|RedirectResponse
    {
        $document = OperationalDocument::find($id);
        if (! $document) {
            return $this->notFoundResponse('Document');
        }

        return $this->streamDocument($document);
    }

    private function streamDocument(OperationalDocument $document): JsonResponse|StreamedResponse|BinaryFileResponse|RedirectResponse
    {
        $response = $this->documentFiles->downloadResponse($document);
        if ($response === null) {
            return $this->notFoundResponse('Document file');
        }

        return $response;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatDocument(OperationalDocument $document): array
    {
        return [
            'id' => $document->id,
            'slug' => $document->slug,
            'title' => $document->title,
            'category' => $document->category,
            'audience' => $document->audience,
            'file_name' => $document->file_name,
            'mime_type' => $document->mime_type,
            'external_url' => $document->external_url,
            'has_download' => $this->documentFiles->hasDownloadableFile($document),
            'version' => $document->version,
            'is_published' => $document->is_published,
            'internal_only' => $document->internal_only,
            'uploaded_by_name' => $document->uploadedBy?->name,
            'created_at' => $document->created_at?->toIso8601String(),
            'updated_at' => $document->updated_at?->toIso8601String(),
        ];
    }
}
