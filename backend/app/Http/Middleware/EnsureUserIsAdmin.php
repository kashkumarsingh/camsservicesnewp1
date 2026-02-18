<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure User Is Admin Middleware
 * 
 * Clean Architecture: Interface Layer
 * Purpose: Ensures user has admin or super_admin role
 * Location: backend/app/Http/Middleware/EnsureUserIsAdmin.php
 */
class EnsureUserIsAdmin
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
        
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
                'errors' => [
                    'authorization' => ['You do not have permission to access this resource.']
                ]
            ], 403);
        }
        
        return $next($request);
    }
}

