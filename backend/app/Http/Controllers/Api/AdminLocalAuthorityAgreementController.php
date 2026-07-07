<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocalAuthorityAgreementRequest;
use App\Http\Requests\UpdateLocalAuthorityAgreementRequest;
use App\Models\LocalAuthorityAgreement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin local authority data sharing agreements.
 */
class AdminLocalAuthorityAgreementController extends Controller
{
    use BaseApiController;

    private const DISK = 'local';

    /**
     * GET /api/v1/admin/local-authority-agreements
     */
    public function index(Request $request): JsonResponse
    {
        $query = LocalAuthorityAgreement::query()
            ->with('createdBy:id,name')
            ->orderBy('local_authority_name');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('local_authority_name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%");
            });
        }

        $limit = min(max((int) $request->query('limit', 50), 1), 100);
        $offset = max((int) $request->query('offset', 0), 0);
        $total = (clone $query)->count();

        $agreements = $query->offset($offset)->limit($limit)->get()
            ->map(fn (LocalAuthorityAgreement $a) => $this->formatAgreement($a));

        return $this->successResponse(
            ['agreements' => $agreements],
            null,
            ['total_count' => $total, 'limit' => $limit, 'offset' => $offset]
        );
    }

    /**
     * GET /api/v1/admin/local-authority-agreements/{id}
     */
    public function show(int $id): JsonResponse
    {
        $agreement = LocalAuthorityAgreement::with('createdBy:id,name')->find($id);
        if (! $agreement) {
            return $this->notFoundResponse('Agreement');
        }

        return $this->successResponse(['agreement' => $this->formatAgreement($agreement)]);
    }

    /**
     * POST /api/v1/admin/local-authority-agreements
     */
    public function store(StoreLocalAuthorityAgreementRequest $request): JsonResponse
    {
        $data = $request->validated();

        $agreement = LocalAuthorityAgreement::create([
            'local_authority_name' => $data['local_authority_name'],
            'effective_date' => $data['effective_date'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'status' => $data['status'] ?? LocalAuthorityAgreement::STATUS_DRAFT,
            'contact_name' => $data['contact_name'] ?? null,
            'contact_email' => $data['contact_email'] ?? null,
            'notes' => $data['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        $agreement->load('createdBy:id,name');

        return $this->successResponse(
            ['agreement' => $this->formatAgreement($agreement)],
            'Agreement record created. Upload the signed copy when ready.',
            [],
            201
        );
    }

    /**
     * PATCH /api/v1/admin/local-authority-agreements/{id}
     */
    public function update(UpdateLocalAuthorityAgreementRequest $request, int $id): JsonResponse
    {
        $agreement = LocalAuthorityAgreement::find($id);
        if (! $agreement) {
            return $this->notFoundResponse('Agreement');
        }

        $data = $request->validated();

        if (array_key_exists('local_authority_name', $data)) {
            $agreement->local_authority_name = $data['local_authority_name'];
        }
        if (array_key_exists('effective_date', $data)) {
            $agreement->effective_date = $data['effective_date'];
        }
        if (array_key_exists('expires_at', $data)) {
            $agreement->expires_at = $data['expires_at'];
        }
        if (array_key_exists('status', $data)) {
            $agreement->status = $data['status'];
        }
        if (array_key_exists('contact_name', $data)) {
            $agreement->contact_name = $data['contact_name'];
        }
        if (array_key_exists('contact_email', $data)) {
            $agreement->contact_email = $data['contact_email'];
        }
        if (array_key_exists('notes', $data)) {
            $agreement->notes = $data['notes'];
        }
        if (array_key_exists('signed_at', $data)) {
            $agreement->signed_at = $data['signed_at'];
        }

        if ($agreement->status === LocalAuthorityAgreement::STATUS_ACTIVE && ! $agreement->signed_at && $agreement->hasSignedDocument()) {
            $agreement->signed_at = now();
        }

        $agreement->save();
        $agreement->load('createdBy:id,name');

        return $this->successResponse(
            ['agreement' => $this->formatAgreement($agreement)],
            'Agreement updated successfully.'
        );
    }

    /**
     * POST /api/v1/admin/local-authority-agreements/{id}/signed-document
     */
    public function uploadSignedDocument(Request $request, int $id): JsonResponse
    {
        $agreement = LocalAuthorityAgreement::find($id);
        if (! $agreement) {
            return $this->notFoundResponse('Agreement');
        }

        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        try {
            if ($agreement->signed_storage_path && Storage::disk(self::DISK)->exists($agreement->signed_storage_path)) {
                Storage::disk(self::DISK)->delete($agreement->signed_storage_path);
            }

            $uploaded = $request->file('file');
            $slug = Str::slug($agreement->local_authority_name);
            $extension = $uploaded->getClientOriginalExtension() ?: 'pdf';
            $storagePath = $uploaded->storeAs(
                'local-authority-agreements',
                $slug.'-'.$agreement->id.'.'.$extension,
                self::DISK
            );

            $agreement->signed_storage_path = $storagePath;
            $agreement->signed_file_name = $uploaded->getClientOriginalName();
            $agreement->signed_mime_type = $uploaded->getMimeType() ?: 'application/octet-stream';
            if (! $agreement->signed_at) {
                $agreement->signed_at = now();
            }
            if ($agreement->status === LocalAuthorityAgreement::STATUS_DRAFT) {
                $agreement->status = LocalAuthorityAgreement::STATUS_ACTIVE;
            }
            $agreement->save();
            $agreement->load('createdBy:id,name');

            return $this->successResponse(
                ['agreement' => $this->formatAgreement($agreement)],
                'Signed document uploaded successfully.'
            );
        } catch (\Exception $e) {
            Log::error('Error uploading LA agreement signed document', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to upload signed document.');
        }
    }

    /**
     * GET /api/v1/admin/local-authority-agreements/{id}/download
     */
    public function download(int $id): JsonResponse|StreamedResponse
    {
        $agreement = LocalAuthorityAgreement::find($id);
        if (! $agreement) {
            return $this->notFoundResponse('Agreement');
        }

        if (! $agreement->signed_storage_path || ! Storage::disk(self::DISK)->exists($agreement->signed_storage_path)) {
            return $this->errorResponse('No signed document on file for this agreement.', 'NOT_FOUND', [], 404);
        }

        $fileName = $agreement->signed_file_name ?: basename($agreement->signed_storage_path);

        return Storage::disk(self::DISK)->download($agreement->signed_storage_path, $fileName);
    }

    /**
     * DELETE /api/v1/admin/local-authority-agreements/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $agreement = LocalAuthorityAgreement::find($id);
        if (! $agreement) {
            return $this->notFoundResponse('Agreement');
        }

        try {
            if ($agreement->signed_storage_path && Storage::disk(self::DISK)->exists($agreement->signed_storage_path)) {
                Storage::disk(self::DISK)->delete($agreement->signed_storage_path);
            }
            $agreement->delete();

            return $this->successResponse(null, 'Agreement deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting LA agreement', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return $this->serverErrorResponse('Failed to delete agreement.');
        }
    }

    private function formatAgreement(LocalAuthorityAgreement $agreement): array
    {
        return [
            'id' => $agreement->id,
            'localAuthorityName' => $agreement->local_authority_name,
            'effectiveDate' => $agreement->effective_date?->format('Y-m-d'),
            'expiresAt' => $agreement->expires_at?->format('Y-m-d'),
            'status' => $agreement->status,
            'contactName' => $agreement->contact_name,
            'contactEmail' => $agreement->contact_email,
            'notes' => $agreement->notes,
            'hasSignedDocument' => $agreement->hasSignedDocument(),
            'signedFileName' => $agreement->signed_file_name,
            'signedAt' => $agreement->signed_at?->toIso8601String(),
            'createdByName' => $agreement->createdBy?->name,
            'createdAt' => $agreement->created_at->toIso8601String(),
            'updatedAt' => $agreement->updated_at->toIso8601String(),
        ];
    }
}
