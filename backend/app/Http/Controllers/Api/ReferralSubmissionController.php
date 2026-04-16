<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReferralSubmissionRequest;
use App\Models\ReferralSubmission;
use Illuminate\Http\JsonResponse;

class ReferralSubmissionController extends Controller
{
    use BaseApiController;

    /**
     * Store a referral submission using the contact submissions pipeline.
     *
     * POST /api/v1/referrals
     */
    public function store(StoreReferralSubmissionRequest $request): JsonResponse
    {
        $submission = ReferralSubmission::create([
            ...$request->validated(),
            'status' => ReferralSubmission::STATUS_PENDING,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $this->successResponse([
            'id' => (string) $submission->id,
            'status' => $submission->status,
        ], 'Referral submitted successfully.', [], 201);
    }
}

