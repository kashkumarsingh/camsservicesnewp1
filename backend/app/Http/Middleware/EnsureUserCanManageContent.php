<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\ErrorCodes;
use App\Support\ApiResponseHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensure User Can Manage Content Middleware
 *
 * Clean Architecture: Interface Layer
 * Purpose: Allows admins, super_admins and editors to access content
 *          management endpoints (public pages, blog, SEO tools).
 */
class EnsureUserCanManageContent
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

        if (! in_array($user->role, ['admin', 'super_admin', 'editor'], true)) {
            return apiResponseWithCors($request, ApiResponseHelper::errorResponse(
                'Unauthorized. Content editor access required.',
                403,
                ErrorCodes::FORBIDDEN,
                ['authorization' => ['You do not have permission to manage public content.']],
                $request
            ));
        }

        return $next($request);
    }
}

