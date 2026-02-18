<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Requests\UpdateTrainerSafeguardingConcernRequest;
use App\Models\BookingSchedule;
use App\Models\SafeguardingConcern;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Trainer Safeguarding Concerns API
 *
 * Purpose: List and update safeguarding concerns that relate to children the trainer has sessions with.
 * Location: backend/app/Http/Controllers/Api/TrainerSafeguardingConcernController.php
 */
class TrainerSafeguardingConcernController extends Controller
{
    use BaseApiController;

    /**
     * Resolve child IDs the authenticated trainer has sessions with.
     */
    private function trainerChildIds(Request $request): array
    {
        $user = $request->user();
        if (! $user) {
            return [];
        }

        $trainer = Trainer::where('user_id', $user->id)->first();
        if (! $trainer) {
            return [];
        }

        return BookingSchedule::where('trainer_id', $trainer->id)
            ->with('booking.participants')
            ->get()
            ->flatMap(fn ($schedule) => $schedule->booking?->participants?->pluck('child_id') ?? collect())
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * List concerns related to the authenticated trainer's sessions.
     * A concern is "related" if its child_id appears in any of the trainer's booking schedules (via booking participants).
     *
     * GET /api/v1/trainer/safeguarding-concerns
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $trainer = Trainer::where('user_id', $user->id)->first();
        if (! $trainer) {
            return $this->successResponse(['concerns' => []], 'No trainer profile.', [], 200);
        }

        $childIds = $this->trainerChildIds($request);
        if (empty($childIds)) {
            return $this->successResponse(['concerns' => []], 'No related concerns.', [], 200);
        }

        $concerns = SafeguardingConcern::whereIn('child_id', $childIds)
            ->with(['user:id,name,email', 'child:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn (SafeguardingConcern $c) => $this->concernToPayload($c));

        return $this->successResponse(['concerns' => $concerns], null, [], 200);
    }

    /**
     * Acknowledge a concern and/or add a note for the DSL. Only concerns related to the trainer's sessions can be updated.
     *
     * PATCH /api/v1/trainer/safeguarding-concerns/{id}
     */
    public function update(UpdateTrainerSafeguardingConcernRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $childIds = $this->trainerChildIds($request);
        if (empty($childIds)) {
            return $this->successResponse(['concern' => null], 'No related concerns.', [], 200);
        }

        $concern = SafeguardingConcern::where('id', $id)->whereIn('child_id', $childIds)->first();
        if (! $concern) {
            return response()->json(['message' => 'Concern not found or you do not have access.'], 404);
        }

        if ($request->boolean('acknowledged')) {
            $concern->trainer_acknowledged_at = $concern->trainer_acknowledged_at ?? now();
            $concern->acknowledged_by_user_id = $concern->acknowledged_by_user_id ?? $user->id;
        }
        if ($request->has('note')) {
            $concern->trainer_note = $request->input('note');
        }
        $concern->save();

        return $this->successResponse(['concern' => $this->concernToPayload($concern)], null, [], 200);
    }

    private function concernToPayload(SafeguardingConcern $c): array
    {
        return [
            'id' => $c->id,
            'concernType' => $c->concern_type,
            'description' => $c->description,
            'dateOfConcern' => $c->date_of_concern?->format('Y-m-d'),
            'status' => $c->status,
            'reportedByName' => $c->user?->name,
            'childName' => $c->child?->name,
            'createdAt' => $c->created_at->toIso8601String(),
            'trainerAcknowledgedAt' => $c->trainer_acknowledged_at?->toIso8601String(),
            'trainerNote' => $c->trainer_note,
        ];
    }
}
