<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\TrainerEmergencyContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * TrainerEmergencyContactController
 *
 * Clean Architecture: Interface Layer
 * Purpose: Manage trainer emergency contacts (list/create/update/delete).
 */
class TrainerEmergencyContactController extends Controller
{
    use BaseApiController;
    /**
     * List emergency contacts for the authenticated trainer.
     */
    public function index(Request $request): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        $contacts = $trainer->emergencyContacts()
            ->orderBy('created_at', 'asc')
            ->get(['id', 'name', 'relationship', 'phone', 'email']);

        return $this->successResponse(['emergency_contacts' => $contacts]);
    }

    /**
     * Store a new emergency contact.
     */
    public function store(Request $request): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (! $trainer) {
            return $this->trainerNotFoundResponse();
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:100'],
            'relationship' => ['nullable', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $contact = $trainer->emergencyContacts()->create($validator->validated());

        return $this->successResponse(
            ['emergency_contact' => $contact->only(['id', 'name', 'relationship', 'phone', 'email'])],
            'Emergency contact added successfully',
            [],
            201
        );
    }

    /**
     * Update an existing emergency contact.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        $contact = $trainer->emergencyContacts()->where('id', $id)->first();
        if (! $contact) {
            return $this->notFoundResponse('Emergency contact');
        }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'relationship' => ['sometimes', 'nullable', 'string', 'max:100'],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
            'email' => ['sometimes', 'nullable', 'email', 'max:150'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        $contact->update($validator->validated());

        return $this->successResponse(
            ['emergency_contact' => $contact->only(['id', 'name', 'relationship', 'phone', 'email'])],
            'Emergency contact updated successfully'
        );
    }

    /**
     * Delete an emergency contact.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (! $trainer) {
            return $this->notFoundResponse('Trainer profile');
        }

        $contact = $trainer->emergencyContacts()->where('id', $id)->first();
        if (! $contact) {
            return $this->notFoundResponse('Emergency contact');
        }

        $contact->delete();

        return $this->successResponse([], 'Emergency contact deleted successfully');
    }

    /**
     * Helper: get trainer model for authenticated user.
     */
    protected function getTrainerForUser(Request $request): ?Trainer
    {
        $user = $request->user();

        return Trainer::where('user_id', $user->id)->first();
    }
}

