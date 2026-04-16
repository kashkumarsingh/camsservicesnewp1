<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\ReferralSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReferralSubmissionsController extends Controller
{
    use BaseApiController;

    /**
     * GET /api/v1/admin/referrals
     */
    public function index(Request $request): JsonResponse
    {
        $limit = max(1, min($request->integer('limit', 50), 100));
        $offset = max(0, $request->integer('offset', 0));

        $query = ReferralSubmission::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $totalCount = (clone $query)->count();
        $rows = $query
            ->latest('created_at')
            ->skip($offset)
            ->take($limit)
            ->get();

        $data = $rows->map(fn (ReferralSubmission $submission) => $this->toListItem($submission));

        return $this->successResponse([
            'data' => $data,
            'meta' => [
                'total_count' => $totalCount,
                'limit' => $limit,
                'offset' => $offset,
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/referrals/{id}
     */
    public function show(string $id): JsonResponse
    {
        $submission = ReferralSubmission::query()->find($id);

        if (!$submission) {
            return $this->notFoundResponse('Referral not found.');
        }

        return $this->successResponse($this->toDetailItem($submission));
    }

    private function toListItem(ReferralSubmission $submission): array
    {
        return [
            'id' => (string) $submission->id,
            'referrerName' => $submission->referrer_name,
            'referrerEmail' => $submission->referrer_email,
            'youngPersonName' => $submission->young_person_name,
            'primaryConcern' => $submission->primary_concern,
            'preferredPackage' => $submission->preferred_package,
            'status' => $submission->status,
            'createdAt' => $submission->created_at?->toIso8601String(),
        ];
    }

    private function toDetailItem(ReferralSubmission $submission): array
    {
        return [
            'id' => (string) $submission->id,
            'status' => $submission->status,
            'createdAt' => $submission->created_at?->toIso8601String(),
            'referrerName' => $submission->referrer_name,
            'referrerRole' => $submission->referrer_role,
            'referrerEmail' => $submission->referrer_email,
            'referrerPhone' => $submission->referrer_phone,
            'youngPersonName' => $submission->young_person_name,
            'youngPersonAge' => $submission->young_person_age,
            'schoolSetting' => $submission->school_setting,
            'primaryConcern' => $submission->primary_concern,
            'backgroundContext' => $submission->background_context,
            'successOutcome' => $submission->success_outcome,
            'preferredPackage' => $submission->preferred_package,
            'additionalInfo' => $submission->additional_info,
        ];
    }
}

