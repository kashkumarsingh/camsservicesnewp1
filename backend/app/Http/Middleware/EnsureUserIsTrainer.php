<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure User Is Trainer Middleware
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Ensures user has trainer role and is approved
 * Location: backend/app/Http/Middleware/EnsureUserIsTrainer.php
 */
class EnsureUserIsTrainer
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'errors' => [
                    'authentication' => ['You must be logged in to access this resource.']
                ]
            ], 401);
        }
        
        if ($user->role !== 'trainer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Trainer access required.',
                'errors' => [
                    'authorization' => ['You do not have permission to access this resource. Trainer role required.']
                ]
            ], 403);
        }
        
        if ($user->approval_status !== 'approved') {
            $statusMessage = match($user->approval_status) {
                'pending' => 'Your trainer account is pending admin approval.',
                'rejected' => 'Your trainer account was not approved. Please contact us for more information.',
                default => 'Your trainer account is not approved.',
            };

            return response()->json([
                'success' => false,
                'message' => $statusMessage,
                'errors' => [
                    'approval_status' => [$statusMessage]
                ]
            ], 403);
        }
        
        return $next($request);
    }
}

