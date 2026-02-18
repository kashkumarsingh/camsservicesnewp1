<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

/**
 * Auth Controller (Interface Layer)
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Handles authentication and registration requests
 * Location: backend/app/Http/Controllers/Api/AuthController.php
 */
class AuthController extends Controller
{
    /**
     * Register a new user (parent/guardian)
     * 
     * Sets approval_status = 'pending' by default
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'min:2', 'max:100'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'phone' => ['required', 'string', 'regex:/^(\+44\s?|0)(\d{2,4}\s?\d{3,4}\s?\d{3,4})$/'],
                'address' => ['required', 'string', 'max:500'],
                'postcode' => ['required', 'string', 'max:10', 'regex:/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i'],
                'city' => ['nullable', 'string', 'max:100'],
                'region' => ['nullable', 'string', 'max:100'],
                'registration_source' => ['nullable', 'string', 'in:contact_page,direct,referral'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Use database transaction to ensure atomicity
            // If token creation fails, rollback user creation
            return DB::transaction(function () use ($request) {
                // Create user with approval_status = 'pending'
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'postcode' => $request->postcode,
                    'role' => 'parent',
                    'approval_status' => User::STATUS_PENDING, // Pending approval
                    'registration_source' => $request->registration_source ?? 'direct',
                ]);

                // Refresh user to ensure all attributes are loaded
                $user->refresh();

                // Create access token
                try {
                    // Check if personal_access_tokens table exists
                    if (!Schema::hasTable('personal_access_tokens')) {
                        Log::error('personal_access_tokens table does not exist', [
                            'user_id' => $user->id,
                        ]);
                        throw new \Exception('Authentication system not properly configured. Please run migrations.');
                    }
                    
                    $token = $user->createToken('auth-token')->plainTextToken;
                } catch (\Exception $tokenError) {
                    Log::error('Token creation failed after user creation', [
                        'user_id' => $user->id,
                        'error' => $tokenError->getMessage(),
                        'error_class' => get_class($tokenError),
                        'trace' => $tokenError->getTraceAsString(),
                    ]);
                    
                    // Rollback user creation if token fails
                    throw $tokenError;
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Registration successful. Your account is pending admin approval.',
                    'data' => [
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'phone' => $user->phone,
                            'role' => $user->role,
                            'approval_status' => $user->approval_status,
                            'created_at' => $user->created_at->toIso8601String(),
                        ],
                        'access_token' => $token,
                        'token_type' => 'Bearer',
                    ],
                    'meta' => [
                        'timestamp' => now()->toIso8601String(),
                        'version' => 'v1',
                    ],
                ], 201);
            });

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Your account is pending admin approval.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'approval_status' => $user->approval_status,
                        'created_at' => $user->created_at->toIso8601String(),
                    ],
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                ],
                'meta' => [
                    'timestamp' => now()->toIso8601String(),
                    'version' => 'v1',
                ],
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            $errorInfo = $e->errorInfo ?? [];
            $errorMessage = $e->getMessage();
            $sqlMessage = $errorInfo[2] ?? $errorMessage;
            
            // Log with maximum detail for debugging
            Log::error('Registration database error', [
                'error' => $errorMessage,
                'sql_message' => $sqlMessage,
                'code' => $e->getCode(),
                'sql_state' => $errorInfo[0] ?? null,
                'sql_code' => $errorInfo[1] ?? null,
                'full_error_info' => $errorInfo,
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'password_confirmation']),
            ]);
            
            // In debug mode, include more details in response
            $debugInfo = config('app.debug') ? [
                'sql_error' => $sqlMessage,
                'error_code' => $errorInfo[1] ?? null,
            ] : [];

            // Check if it's a specific database error we can handle
            $userFriendlyMessage = 'Database error occurred. Please try again later.';
            
            // Check for common database errors
            if (str_contains($errorMessage, 'Column not found') || str_contains($errorMessage, "doesn't exist")) {
                $userFriendlyMessage = 'Database schema error. Please contact support.';
            } elseif (str_contains($errorMessage, 'foreign key constraint')) {
                $userFriendlyMessage = 'Database constraint error. Please contact support.';
            } elseif (str_contains($errorMessage, 'Duplicate entry') || str_contains($errorMessage, 'UNIQUE constraint')) {
                // Return 422 for duplicate email (validation error, not server error)
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'email' => ['The email has already been taken.']
                    ],
                ], 422);
            } elseif (str_contains($errorMessage, 'personal_access_tokens') || str_contains($errorMessage, 'token')) {
                $userFriendlyMessage = 'Authentication system error. Please contact support.';
            }

            $response = [
                'success' => false,
                'message' => $userFriendlyMessage,
                'errors' => [],
            ];
            
            // Include debug info if in debug mode
            if (config('app.debug')) {
                $response['debug'] = $debugInfo;
            }
            
            return response()->json($response, 500);
        } catch (\Exception $e) {
            Log::error('Registration error', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'password_confirmation']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during registration. Please try again.',
                'errors' => [],
            ], 500);
        }
    }

    /**
     * Login user
     * 
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Create access token
            try {
                $token = $user->createToken('auth-token')->plainTextToken;
            } catch (\Exception $tokenError) {
                Log::error('Login token creation failed', [
                    'user_id' => $user->id,
                    'error' => $tokenError->getMessage(),
                    'trace' => $tokenError->getTraceAsString(),
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication failed. Please try again.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'approval_status' => $user->approval_status,
                    ],
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                ],
                'meta' => [
                    'timestamp' => now()->toIso8601String(),
                    'version' => 'v1',
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login error', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Server Error',
            ], 500);
        }
    }

    /**
     * Get current authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'address' => $user->address,
                        'postcode' => $user->postcode,
                        'role' => $user->role,
                        'approval_status' => $user->approval_status,
                        'approved_at' => $user->approved_at?->toIso8601String(),
                        'rejected_at' => $user->rejected_at?->toIso8601String(),
                        'rejection_reason' => $user->rejection_reason,
                        'can_book' => $user->canBook(),
                        'created_at' => $user->created_at->toIso8601String(),
                    ],
                ],
                'meta' => [
                    'timestamp' => now()->toIso8601String(),
                    'version' => 'v1',
                ],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Auth user endpoint error', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unable to load user. Please try again.',
            ], 500);
        }
    }

    /**
     * Logout user
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }
}

