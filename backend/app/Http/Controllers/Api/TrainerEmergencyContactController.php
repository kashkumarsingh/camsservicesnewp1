<?php

namespace App\Http\Controllers\Api;

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
    /**
     * List emergency contacts for the authenticated trainer.
     */
    public function index(Request $request): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (! $trainer) {
            return $this->trainerNotFoundResponse();
        }

        $contacts = $trainer->emergencyContacts()
            ->orderBy('created_at', 'asc')
            ->get(['id', 'name', 'relationship', 'phone', 'email']);

        return response()->json([
            'success' => true,
            'data' => [
                'emergency_contacts' => $contacts,
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
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
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contact = $trainer->emergencyContacts()->create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Emergency contact added successfully',
            'data' => [
                'emergency_contact' => $contact->only(['id', 'name', 'relationship', 'phone', 'email']),
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 201);
    }

    /**
     * Update an existing emergency contact.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (! $trainer) {
            return $this->trainerNotFoundResponse();
        }

        $contact = $trainer->emergencyContacts()->where('id', $id)->first();
        if (! $contact) {
            return response()->json([
                'success' => false,
                'message' => 'Emergency contact not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'relationship' => ['sometimes', 'nullable', 'string', 'max:100'],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
            'email' => ['sometimes', 'nullable', 'email', 'max:150'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contact->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Emergency contact updated successfully',
            'data' => [
                'emergency_contact' => $contact->only(['id', 'name', 'relationship', 'phone', 'email']),
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Delete an emergency contact.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (! $trainer) {
            return $this->trainerNotFoundResponse();
        }

        $contact = $trainer->emergencyContacts()->where('id', $id)->first();
        if (! $contact) {
            return response()->json([
                'success' => false,
                'message' => 'Emergency contact not found.',
            ], 404);
        }

        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Emergency contact deleted successfully',
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Helper: get trainer model for authenticated user.
     */
    protected function getTrainerForUser(Request $request): ?Trainer
    {
        $user = $request->user();

        return Trainer::where('user_id', $user->id)->first();
    }

    protected function trainerNotFoundResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Trainer profile not found. Please contact admin.',
        ], 404);
    }
}

