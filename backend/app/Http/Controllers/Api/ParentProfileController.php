<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
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
    use BaseApiController;

    /**
     * Get the authenticated parent's profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || $user->role !== 'parent') {
            return $this->forbiddenResponse('Only parents can access this endpoint.');
        }

        $profile = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'postcode' => $user->postcode,
        ];

        return $this->successResponse(['profile' => $profile]);
    }

    /**
     * Update the authenticated parent's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || $user->role !== 'parent') {
            return $this->forbiddenResponse('Only parents can update this profile.');
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'postcode' => ['nullable', 'string', 'max:10'],
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        // Update all provided fields, including null values (to clear fields)
        $updateData = ['name' => $request->input('name')];
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
        $user->refresh();

        $profile = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'postcode' => $user->postcode,
        ];

        return $this->successResponse(['profile' => $profile], 'Profile updated successfully.');
    }
}


