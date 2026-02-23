<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\ErrorCodes;
use App\Support\ApiResponseHelper;
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

        if (! $user) {
            return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                'Authentication required',
                401,
                ErrorCodes::UNAUTHORIZED,
                ['authentication' => ['You must be logged in to access this resource.']],
                $request
            ));
        }

        if (! in_array($user->role, ['admin', 'super_admin'])) {
            return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                'Unauthorized. Admin access required.',
                403,
                ErrorCodes::FORBIDDEN,
                ['authorization' => ['You do not have permission to access this resource.']],
                $request
            ));
        }

        return $next($request);
    }
}

