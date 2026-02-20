<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Api\ErrorCodes;
use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\ChildChecklist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Child Checklist Controller (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles child checklist operations
 * Location: backend/app/Http/Controllers/Api/ChildChecklistController.php
 */
class ChildChecklistController extends Controller
{
    use BaseApiController;
    /**
     * Get checklist for a child
     * 
     * @param Request $request
     * @param int $childId
     * @return JsonResponse
     */
    public function show(Request $request, int $childId): JsonResponse
    {
        $user = $request->user();
        
        $child = $user->children()->find($childId);

        if (! $child) {
            return $this->notFoundResponse('Child');
        }

        $checklist = $child->checklist;

        if (! $checklist) {
            return $this->notFoundResponse('Checklist');
        }

        return $this->successResponse(['checklist' => $this->formatChecklist($checklist)]);
    }

    /**
     * Create or update checklist for a child
     * 
     * @param Request $request
     * @param int $childId
     * @return JsonResponse
     */
    public function store(Request $request, int $childId): JsonResponse
    {
        $user = $request->user();
        
        $child = $user->children()->find($childId);

        if (! $child) {
            return $this->notFoundResponse('Child');
        }

        $validator = Validator::make($request->all(), [
            'medical_conditions' => ['nullable', 'string', 'max:2000'],
            'allergies' => ['nullable', 'string', 'max:2000'],
            'medications' => ['nullable', 'string', 'max:2000'],
            'dietary_requirements' => ['nullable', 'string', 'max:2000'],
            'emergency_contact_name' => ['required', 'string', 'max:100'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
            'emergency_contact_phone' => ['required', 'string', 'regex:/^(\+44\s?|0)(\d{2,4}\s?\d{3,4}\s?\d{3,4})$/'],
            'emergency_contact_phone_alt' => ['nullable', 'string', 'regex:/^(\+44\s?|0)(\d{2,4}\s?\d{3,4}\s?\d{3,4})$/'],
            'emergency_contact_address' => ['nullable', 'string', 'max:500'],
            'special_needs' => ['nullable', 'string', 'max:2000'],
            'behavioral_notes' => ['nullable', 'string', 'max:2000'],
            'activity_restrictions' => ['nullable', 'string', 'max:2000'],
            'consent_photography' => ['nullable', 'boolean'],
            'consent_medical_treatment' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // Create or update checklist
        $checklist = $child->checklist ?? new ChildChecklist(['child_id' => $child->id]);
        $checklist->fill($validator->validated());
        $checklist->save();

        $dispatcher = app(\App\Contracts\Notifications\INotificationDispatcher::class);
        $dispatcher->dispatch(\App\Services\Notifications\NotificationIntentFactory::childChecklistSubmitted($child, $checklist));
        $dispatcher->dispatch(\App\Services\Notifications\NotificationIntentFactory::childChecklistSubmittedToAdmin($child, $checklist));

        return $this->successResponse(
            ['checklist' => $this->formatChecklist($checklist)],
            'Checklist saved successfully. Admin will review and notify you.'
        );
    }

    /**
     * Format checklist for response
     * 
     * @param ChildChecklist $checklist
     * @return array
     */
    private function formatChecklist(ChildChecklist $checklist): array
    {
        return [
            'id' => $checklist->id,
            'child_id' => $checklist->child_id,
            'medical_conditions' => $checklist->medical_conditions,
            'allergies' => $checklist->allergies,
            'medications' => $checklist->medications,
            'dietary_requirements' => $checklist->dietary_requirements,
            'emergency_contact_name' => $checklist->emergency_contact_name,
            'emergency_contact_relationship' => $checklist->emergency_contact_relationship,
            'emergency_contact_phone' => $checklist->emergency_contact_phone,
            'emergency_contact_phone_alt' => $checklist->emergency_contact_phone_alt,
            'emergency_contact_address' => $checklist->emergency_contact_address,
            'special_needs' => $checklist->special_needs,
            'behavioral_notes' => $checklist->behavioral_notes,
            'activity_restrictions' => $checklist->activity_restrictions,
            'consent_photography' => $checklist->consent_photography,
            'consent_medical_treatment' => $checklist->consent_medical_treatment,
            'checklist_completed' => $checklist->checklist_completed,
            'checklist_completed_at' => $checklist->checklist_completed_at?->toIso8601String(),
            'created_at' => $checklist->created_at->toIso8601String(),
            'updated_at' => $checklist->updated_at->toIso8601String(),
        ];
    }
}

