<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSafeguardingConcernRequest;
use App\Models\SafeguardingConcern;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Parent Safeguarding Concern API
 *
 * Clean Architecture: Interface Adapter (API Controller)
 * Purpose: Accept parent-reported safeguarding concerns from the dashboard.
 * Location: backend/app/Http/Controllers/Api/ParentSafeguardingConcernController.php
 */
class ParentSafeguardingConcernController extends Controller
{
    use BaseApiController;

    /**
     * Store a new safeguarding concern (authenticated parent).
     *
     * POST /api/v1/dashboard/safeguarding-concerns
     */
    public function store(StoreSafeguardingConcernRequest $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        try {
            $data = $request->validated();
            $data['user_id'] = $user->id;
            $data['status'] = SafeguardingConcern::STATUS_PENDING;
            $data['ip_address'] = $request->ip();
            $data['user_agent'] = $request->userAgent();

            $concern = SafeguardingConcern::create($data);

            return $this->successResponse(
                ['id' => $concern->id],
                'Your concern has been recorded. Our Designated Safeguarding Lead will be in touch.',
                [],
                201
            );
        } catch (\Throwable $e) {
            Log::error('Safeguarding concern submit error', [
                'user_id' => $user->id,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse(
                'Something went wrong. Please try again or contact us directly.',
                \App\Http\Controllers\Api\ErrorCodes::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }
}
