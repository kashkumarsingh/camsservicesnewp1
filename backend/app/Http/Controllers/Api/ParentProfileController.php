<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Parent Profile Controller (API)
 *
 * Clean Architecture: Interface Layer (HTTP Controllers)
 * Purpose: Allow parents to view and update their own profile details.
 * Location: backend/app/Http/Controllers/Api/ParentProfileController.php
 */
class ParentProfileController extends Controller
{
    /**
     * Get the authenticated parent's profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'parent') {
            return response()->json([
                'success' => false,
                'message' => 'Only parents can access this endpoint.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'profile' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'postcode' => $user->postcode,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ]);
    }

    /**
     * Update the authenticated parent's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'parent') {
            return response()->json([
                'success' => false,
                'message' => 'Only parents can update this profile.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'postcode' => ['nullable', 'string', 'max:10'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update all provided fields, including null values (to clear fields)
        // Use array_key_exists to check if key exists in request, even if value is null
        $updateData = [
            'name' => $request->input('name'),
        ];

        // Always update phone, address, postcode if they're in the request (even if null)
        // Use array_key_exists instead of has() because has() returns false for null values
        if (array_key_exists('phone', $request->all())) {
            $updateData['phone'] = $request->input('phone') ?: null;
        }
        if (array_key_exists('address', $request->all())) {
            $updateData['address'] = $request->input('address') ?: null;
        }
        if (array_key_exists('postcode', $request->all())) {
            $updateData['postcode'] = $request->input('postcode') ?: null;
        }

        $user->update($updateData);
        
        // Refresh the model to get updated values
        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => [
                'profile' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'postcode' => $user->postcode,
                ],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ]);
    }
}


