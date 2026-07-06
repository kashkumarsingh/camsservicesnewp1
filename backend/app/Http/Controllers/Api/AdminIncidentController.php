<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAdminIncidentRequest;
use App\Models\Incident;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin incident triage and review API.
 */
class AdminIncidentController extends Controller
{
    use BaseApiController;

    /**
     * GET /api/v1/admin/incidents
     */
    public function index(Request $request): JsonResponse
    {
        $query = Incident::query()
            ->with([
                'child:id,name',
                'reportedBy:id,name,email',
                'reviewedBy:id,name',
            ])
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->query('type')) {
            $query->where('incident_type', $type);
        }

        $limit = min((int) $request->query('limit', 50), 100);
        $offset = max((int) $request->query('offset', 0), 0);

        $total = (clone $query)->count();
        $incidents = $query->offset($offset)->limit($limit)->get()
            ->map(fn (Incident $incident) => $this->incidentToPayload($incident));

        return $this->successResponse(
            ['incidents' => $incidents],
            null,
            ['total_count' => $total, 'limit' => $limit, 'offset' => $offset]
        );
    }

    /**
     * GET /api/v1/admin/incidents/{id}
     */
    public function show(int $id): JsonResponse
    {
        $incident = Incident::with([
            'child:id,name',
            'reportedBy:id,name,email',
            'reviewedBy:id,name',
            'bookingSchedule:id,date,start_time,end_time',
        ])->find($id);

        if (! $incident) {
            return $this->notFoundResponse('Incident');
        }

        return $this->successResponse(['incident' => $this->incidentToPayload($incident, true)]);
    }

    /**
     * PATCH /api/v1/admin/incidents/{id}
     */
    public function update(UpdateAdminIncidentRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $incident = Incident::find($id);
        if (! $incident) {
            return $this->notFoundResponse('Incident');
        }

        $data = $request->validated();

        if (array_key_exists('status', $data)) {
            $incident->status = $data['status'];
        }
        if (array_key_exists('follow_up_notes', $data)) {
            $incident->follow_up_notes = $data['follow_up_notes'];
        }
        if (array_key_exists('immediate_actions', $data)) {
            $incident->immediate_actions = $data['immediate_actions'];
        }
        if ($request->boolean('dsl_reviewed')) {
            $incident->dsl_reviewed_at = $incident->dsl_reviewed_at ?? now();
            $incident->reviewed_by_user_id = $incident->reviewed_by_user_id ?? $user->id;
            if ($incident->status === Incident::STATUS_OPEN) {
                $incident->status = Incident::STATUS_REVIEWING;
            }
        }

        $incident->save();
        $incident->load(['child:id,name', 'reportedBy:id,name,email', 'reviewedBy:id,name']);

        return $this->successResponse(['incident' => $this->incidentToPayload($incident, true)]);
    }

    private function incidentToPayload(Incident $incident, bool $detailed = false): array
    {
        $payload = [
            'id' => $incident->id,
            'reference' => $incident->reference,
            'incidentType' => $incident->incident_type,
            'severity' => $incident->severity,
            'description' => $incident->description,
            'location' => $incident->location,
            'occurredAt' => $incident->occurred_at?->toIso8601String(),
            'childId' => $incident->child_id,
            'childName' => $incident->child?->name,
            'bookingScheduleId' => $incident->booking_schedule_id,
            'status' => $incident->status,
            'immediateActions' => $incident->immediate_actions,
            'reportedByName' => $incident->reportedBy?->name,
            'reportedByEmail' => $incident->reportedBy?->email,
            'dslReviewedAt' => $incident->dsl_reviewed_at?->toIso8601String(),
            'reviewedByName' => $incident->reviewedBy?->name,
            'createdAt' => $incident->created_at->toIso8601String(),
            'updatedAt' => $incident->updated_at->toIso8601String(),
        ];

        if ($detailed) {
            $payload['followUpNotes'] = $incident->follow_up_notes;
            if ($incident->relationLoaded('bookingSchedule') && $incident->bookingSchedule) {
                $schedule = $incident->bookingSchedule;
                $payload['sessionDate'] = $schedule->date;
                $payload['sessionStartTime'] = $schedule->start_time;
                $payload['sessionEndTime'] = $schedule->end_time;
            }
        }

        return $payload;
    }
}
