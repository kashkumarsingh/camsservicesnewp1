<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\TrainerApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin Trainer Applications Controller
 *
 * Purpose: List and manage trainer applications (approve/reject).
 * Guards: auth:sanctum + admin middleware
 */
class AdminTrainerApplicationsController extends Controller
{
    use BaseApiController;

    /**
     * List trainer applications for admin.
     *
     * GET /api/v1/admin/trainer-applications
     *
     * Query: status (submitted, under_review, approved, rejected), limit, offset
     */
    public function index(Request $request): JsonResponse
    {
        $query = TrainerApplication::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $limit = max(1, min($request->integer('limit', 50), 100));
        $offset = max(0, $request->integer('offset', 0));
        $totalCount = (clone $query)->count();

        $applications = $query
            ->orderByDesc('created_at')
            ->skip($offset)
            ->take($limit)
            ->get();

        $data = $applications->map(fn (TrainerApplication $a) => $this->formatApplication($a));

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
     * Get a single trainer application.
     *
     * GET /api/v1/admin/trainer-applications/{id}
     */
    public function show(string $id): JsonResponse
    {
        $application = TrainerApplication::find($id);
        if (!$application) {
            return $this->notFoundResponse('Trainer application not found.');
        }
        return $this->successResponse($this->formatApplicationFull($application));
    }

    /**
     * Approve a trainer application.
     *
     * POST /api/v1/admin/trainer-applications/{id}/approve
     * Body: { "notes": "optional", "createUserAccount": true }
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $application = TrainerApplication::find($id);
        if (!$application) {
            return $this->notFoundResponse('Trainer application not found.');
        }
        $allowedStatuses = [
            TrainerApplication::STATUS_SUBMITTED,
            TrainerApplication::STATUS_UNDER_REVIEW,
            TrainerApplication::STATUS_INFORMATION_REQUESTED,
        ];
        if (!in_array($application->status, $allowedStatuses, true)) {
            return $this->errorResponse('Application is not pending review.', null, [], 422);
        }

        $user = $request->user();
        $notes = $request->input('notes');
        $createUserAccount = $request->boolean('createUserAccount', true);

        try {
            $trainer = $application->approve($user, $notes, $createUserAccount);
            return $this->successResponse([
                'applicationId' => (string) $application->id,
                'trainerId' => (string) $trainer->id,
                'message' => 'Application approved. Trainer profile created.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin approve trainer application failed', [
                'application_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return $this->serverErrorResponse('Failed to approve application.');
        }
    }

    /**
     * Reject a trainer application.
     *
     * POST /api/v1/admin/trainer-applications/{id}/reject
     * Body: { "reason": "optional" }
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $application = TrainerApplication::find($id);
        if (!$application) {
            return $this->notFoundResponse('Trainer application not found.');
        }
        $allowedStatuses = [
            TrainerApplication::STATUS_SUBMITTED,
            TrainerApplication::STATUS_UNDER_REVIEW,
            TrainerApplication::STATUS_INFORMATION_REQUESTED,
        ];
        if (!in_array($application->status, $allowedStatuses, true)) {
            return $this->errorResponse('Application is not pending review.', null, [], 422);
        }

        $user = $request->user();
        $reason = $request->input('reason');

        try {
            $application->reject($user, $reason);
            return $this->successResponse([
                'applicationId' => (string) $application->id,
                'message' => 'Application rejected.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin reject trainer application failed', [
                'application_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return $this->serverErrorResponse('Failed to reject application.');
        }
    }

    /**
     * Request more information from the applicant.
     *
     * POST /api/v1/admin/trainer-applications/{id}/request-information
     * Body: { "message": "required" }
     */
    public function requestInformation(Request $request, string $id): JsonResponse
    {
        $application = TrainerApplication::find($id);
        if (!$application) {
            return $this->notFoundResponse('Trainer application not found.');
        }
        $message = $request->input('message');
        if (!is_string($message) || trim($message) === '') {
            return $this->errorResponse('A message to the applicant is required.', null, [], 422);
        }
        try {
            $application->requestInformation($request->user(), trim($message));
            return $this->successResponse([
                'applicationId' => (string) $application->id,
                'status' => $application->status,
                'message' => 'Information request sent. Applicant will be emailed with a link to respond.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 422);
        } catch (\Exception $e) {
            \Log::error('Admin request information failed', ['application_id' => $id, 'error' => $e->getMessage()]);
            return $this->serverErrorResponse('Failed to send information request.');
        }
    }

    /**
     * Update application (admin edit). Only when status is submitted, under_review, or information_requested.
     *
     * PATCH /api/v1/admin/trainer-applications/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $application = TrainerApplication::find($id);
        if (!$application) {
            return $this->notFoundResponse('Trainer application not found.');
        }
        $allowedStatuses = [
            TrainerApplication::STATUS_SUBMITTED,
            TrainerApplication::STATUS_UNDER_REVIEW,
            TrainerApplication::STATUS_INFORMATION_REQUESTED,
        ];
        if (!in_array($application->status, $allowedStatuses, true)) {
            return $this->errorResponse('Application can no longer be edited.', null, [], 422);
        }
        $allowed = [
            'first_name', 'last_name', 'email', 'phone', 'postcode',
            'address_line_one', 'address_line_two', 'city', 'county',
            'travel_radius_km', 'availability_preferences', 'preferred_age_groups',
            'experience_years', 'bio', 'certifications', 'has_dbs_check',
            'dbs_issued_at', 'dbs_expires_at', 'insurance_provider', 'insurance_expires_at',
            'desired_hourly_rate', 'exclusion_reason', 'review_notes',
        ];
        $data = $request->only($allowed);
        $data = array_filter($data, fn ($v) => $v !== null);
        if (isset($data['availability_preferences']) && !is_array($data['availability_preferences'])) {
            $data['availability_preferences'] = is_string($data['availability_preferences'])
                ? json_decode($data['availability_preferences'], true) : [];
        }
        if (isset($data['preferred_age_groups']) && !is_array($data['preferred_age_groups'])) {
            $data['preferred_age_groups'] = is_string($data['preferred_age_groups'])
                ? json_decode($data['preferred_age_groups'], true) : [];
        }
        if (isset($data['certifications']) && !is_array($data['certifications'])) {
            $data['certifications'] = is_string($data['certifications'])
                ? json_decode($data['certifications'], true) : [];
        }
        $application->update($data);
        return $this->successResponse($this->formatApplicationFull($application));
    }

    private function formatApplication(TrainerApplication $a): array
    {
        return [
            'id' => (string) $a->id,
            'reference' => 'CAMS-TA-' . $a->id,
            'firstName' => $a->first_name,
            'lastName' => $a->last_name,
            'fullName' => $a->full_name,
            'email' => $a->email,
            'phone' => $a->phone,
            'postcode' => $a->postcode,
            'status' => $a->status,
            'experienceYears' => (int) ($a->experience_years ?? 0),
            'hasDbsCheck' => (bool) $a->has_dbs_check,
            'createdAt' => $a->created_at?->toIso8601String(),
            'reviewedAt' => $a->reviewed_at?->toIso8601String(),
        ];
    }

    /** Full application payload for admin detail view. */
    private function formatApplicationFull(TrainerApplication $a): array
    {
        return [
            'id' => (string) $a->id,
            'reference' => 'CAMS-TA-' . $a->id,
            'firstName' => $a->first_name,
            'lastName' => $a->last_name,
            'fullName' => $a->full_name,
            'email' => $a->email,
            'phone' => $a->phone,
            'postcode' => $a->postcode,
            'addressLineOne' => $a->address_line_one,
            'addressLineTwo' => $a->address_line_two,
            'city' => $a->city,
            'county' => $a->county,
            'travelRadiusKm' => (int) ($a->travel_radius_km ?? 0),
            'serviceAreaPostcodes' => $a->service_area_postcodes ?? [],
            'availabilityPreferences' => $a->availability_preferences ?? [],
            'excludedActivityIds' => $a->excluded_activity_ids ?? [],
            'exclusionReason' => $a->exclusion_reason,
            'preferredAgeGroups' => $a->preferred_age_groups ?? [],
            'experienceYears' => (int) ($a->experience_years ?? 0),
            'bio' => $a->bio,
            'certifications' => $a->certifications ?? [],
            'hasDbsCheck' => (bool) $a->has_dbs_check,
            'dbsIssuedAt' => $a->dbs_issued_at?->format('Y-m-d'),
            'dbsExpiresAt' => $a->dbs_expires_at?->format('Y-m-d'),
            'insuranceProvider' => $a->insurance_provider,
            'insuranceExpiresAt' => $a->insurance_expires_at?->format('Y-m-d'),
            'desiredHourlyRate' => $a->desired_hourly_rate !== null ? (float) $a->desired_hourly_rate : null,
            'attachments' => $a->attachments ?? [],
            'status' => $a->status,
            'reviewedAt' => $a->reviewed_at?->toIso8601String(),
            'reviewNotes' => $a->review_notes,
            'adminRequestMessage' => $a->admin_request_message,
            'adminRequestedAt' => $a->admin_requested_at?->toIso8601String(),
            'trainerResponseMessage' => $a->trainer_response_message,
            'trainerResponseAt' => $a->trainer_response_at?->toIso8601String(),
            'createdAt' => $a->created_at?->toIso8601String(),
            'updatedAt' => $a->updated_at?->toIso8601String(),
        ];
    }
}
