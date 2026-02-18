<?php

namespace App\Http\Controllers\Api;

use App\Actions\Child\RemoveChildAction;
use App\Http\Controllers\Controller;
use App\Models\Child;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Child Controller (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles child CRUD operations
 * Location: backend/app/Http/Controllers/Api/ChildController.php
 */
class ChildController extends Controller
{
    /**
     * Get all children for authenticated user
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $children = $user->children()
            ->with('checklist')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'children' => $children->map(function ($child) use ($user) {
                    return [
                        'id' => $child->id,
                        'name' => $child->name,
                        'age' => $child->age,
                        'date_of_birth' => $child->date_of_birth?->format('Y-m-d'),
                        'gender' => $child->gender,
                        'address' => $child->address,
                        'postcode' => $child->postcode,
                        'city' => $child->city,
                        'region' => $child->region,
                        'approval_status' => $child->approval_status,
                        'approved_at' => $child->approved_at?->toIso8601String(),
                        'rejected_at' => $child->rejected_at?->toIso8601String(),
                        'rejection_reason' => $child->rejection_reason,
                        'has_checklist' => $child->checklist !== null,
                        'checklist_completed' => $child->checklist?->checklist_completed ?? false,
                        'created_at' => $child->created_at->toIso8601String(),
                        'can_archive' => $user->can('archive', $child),
                        'can_delete' => $user->can('delete', $child),
                    ];
                }),
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
                'count' => $children->count(),
            ],
        ], 200);
    }

    /**
     * Get a specific child
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        
        $child = $user->children()->with('checklist')->find($id);

        if (!$child) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'age' => $child->age,
                    'date_of_birth' => $child->date_of_birth?->format('Y-m-d'),
                    'gender' => $child->gender,
                    'address' => $child->address,
                    'postcode' => $child->postcode,
                    'city' => $child->city,
                    'region' => $child->region,
                    'latitude' => $child->latitude,
                    'longitude' => $child->longitude,
                    'approval_status' => $child->approval_status,
                    'approved_at' => $child->approved_at?->toIso8601String(),
                    'rejected_at' => $child->rejected_at?->toIso8601String(),
                    'rejection_reason' => $child->rejection_reason,
                    'has_checklist' => $child->checklist !== null,
                    'checklist_completed' => $child->checklist?->checklist_completed ?? false,
                    'created_at' => $child->created_at->toIso8601String(),
                    'can_archive' => $user->can('archive', $child),
                    'can_delete' => $user->can('delete', $child),
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Create a new child
     * 
     * Sets approval_status = 'pending' by default
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'age' => ['nullable', 'integer', 'min:0', 'max:25'], // Optional - can be calculated from DOB
            'gender' => ['nullable', 'string', 'in:male,female,other,prefer_not_to_say'],
            'address' => ['nullable', 'string', 'max:500'],
            'postcode' => ['nullable', 'string', 'max:10', 'regex:/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i'],
            'city' => ['nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Calculate age from DOB if not provided
        $age = $request->age;
        if (!$age && $request->date_of_birth) {
            $dob = new \DateTime($request->date_of_birth);
            $today = new \DateTime();
            $age = $today->diff($dob)->y;
        }

        $child = Child::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'age' => $age ?? 0,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'address' => $request->address,
            'postcode' => $request->postcode,
            'city' => $request->city,
            'region' => $request->region,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'approval_status' => Child::STATUS_PENDING, // Pending approval
        ]);

        // Do not notify admins here: "Child approval required" / "checklist has been submitted"
        // is sent only when the parent submits the checklist (ChildChecklistController).

        return response()->json([
            'success' => true,
            'message' => 'Child added successfully. Pending admin approval.',
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'age' => $child->age,
                    'approval_status' => $child->approval_status,
                    'created_at' => $child->created_at->toIso8601String(),
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 201);
    }

    /**
     * Update a child
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        
        $child = $user->children()->find($id);

        if (!$child) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found',
            ], 404);
        }

        // If child is approved, only allow certain fields to be updated
        if ($child->isApproved()) {
            $validator = Validator::make($request->all(), [
                'address' => ['nullable', 'string', 'max:500'],
                'postcode' => ['nullable', 'string', 'max:10', 'regex:/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i'],
                'city' => ['nullable', 'string', 'max:100'],
                'region' => ['nullable', 'string', 'max:100'],
            ]);
        } else {
            $validator = Validator::make($request->all(), [
                'name' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
                'age' => ['sometimes', 'required', 'integer', 'min:0', 'max:25'],
                'date_of_birth' => ['nullable', 'date', 'before:today'],
                'gender' => ['nullable', 'string', 'in:male,female,other,prefer_not_to_say'],
                'address' => ['nullable', 'string', 'max:500'],
                'postcode' => ['nullable', 'string', 'max:10', 'regex:/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i'],
                'city' => ['nullable', 'string', 'max:100'],
                'region' => ['nullable', 'string', 'max:100'],
            ]);
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $child->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Child updated successfully',
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'age' => $child->age,
                    'approval_status' => $child->approval_status,
                    'updated_at' => $child->updated_at->toIso8601String(),
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Archive a child (soft delete).
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function archive(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

        $this->authorize('archive', $child);

        if (!$child->isArchivalEligible()) {
            return response()->json([
                'success' => false,
                'message' => 'Child cannot be archived at this time.',
            ], 422);
        }

        $child->delete();

        return response()->json([
            'success' => true,
            'message' => 'Child archived successfully',
        ]);
    }

    /**
     * Delete a child
     * 
     * @param Request $request
     * @param int $id
     * @param RemoveChildAction $removeChildAction
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id, RemoveChildAction $removeChildAction): JsonResponse
    {
        $user = $request->user();
        
        $child = $user->children()->find($id);
        if (!$child) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found',
            ], 404);
        }

        $this->authorize('delete', $child);

        if (!$child->isDeletionAllowed()) {
            return response()->json([
                'success' => false,
                'message' => 'This child cannot be deleted because they have booking, payment, or attendance history. Please archive them instead so records are preserved.',
                'action' => 'archive',
            ], 403);
        }

        $removeChildAction->execute($child);

        return response()->json([
            'success' => true,
            'message' => 'Child deleted successfully',
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
}
