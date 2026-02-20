<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\UserChecklist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * User Checklist Controller (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles user (parent/guardian) checklist operations
 * Location: backend/app/Http/Controllers/Api/UserChecklistController.php
 */
class UserChecklistController extends Controller
{
    use BaseApiController;
    /**
     * Get checklist for authenticated user
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $checklist = $user->checklist;

        if (! $checklist) {
            return $this->notFoundResponse('Checklist');
        }

        return $this->successResponse(['checklist' => $this->formatChecklist($checklist)]);
    }

    /**
     * Create or update checklist for authenticated user
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'identity_document_type' => ['nullable', 'string', 'max:50'],
            'identity_document_reference' => ['nullable', 'string', 'max:100'],
            'reference_1_name' => ['nullable', 'string', 'max:100'],
            'reference_1_contact' => ['nullable', 'string', 'max:100'],
            'reference_2_name' => ['nullable', 'string', 'max:100'],
            'reference_2_contact' => ['nullable', 'string', 'max:100'],
            'consent_data_processing' => ['nullable', 'boolean'],
            'consent_marketing' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // Create or update checklist
        $checklist = $user->checklist ?? new UserChecklist(['user_id' => $user->id]);
        $checklist->fill($validator->validated());
        $checklist->save();

        return $this->successResponse(
            ['checklist' => $this->formatChecklist($checklist)],
            'Checklist saved successfully. Admin will review and notify you.'
        );
    }

    /**
     * Format checklist for response
     * 
     * @param UserChecklist $checklist
     * @return array
     */
    private function formatChecklist(UserChecklist $checklist): array
    {
        return [
            'id' => $checklist->id,
            'user_id' => $checklist->user_id,
            'identity_verified' => $checklist->identity_verified,
            'identity_verified_at' => $checklist->identity_verified_at?->toIso8601String(),
            'identity_document_type' => $checklist->identity_document_type,
            'identity_document_reference' => $checklist->identity_document_reference,
            'reference_1_name' => $checklist->reference_1_name,
            'reference_1_contact' => $checklist->reference_1_contact,
            'reference_1_verified' => $checklist->reference_1_verified,
            'reference_2_name' => $checklist->reference_2_name,
            'reference_2_contact' => $checklist->reference_2_contact,
            'reference_2_verified' => $checklist->reference_2_verified,
            'background_check_completed' => $checklist->background_check_completed,
            'background_check_completed_at' => $checklist->background_check_completed_at?->toIso8601String(),
            'consent_data_processing' => $checklist->consent_data_processing,
            'consent_marketing' => $checklist->consent_marketing,
            'checklist_completed' => $checklist->checklist_completed,
            'checklist_completed_at' => $checklist->checklist_completed_at?->toIso8601String(),
            'created_at' => $checklist->created_at->toIso8601String(),
            'updated_at' => $checklist->updated_at->toIso8601String(),
        ];
    }
}

