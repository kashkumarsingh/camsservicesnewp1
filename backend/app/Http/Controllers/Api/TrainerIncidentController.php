<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Notifications\INotificationDispatcher;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainerIncidentRequest;
use App\Models\BookingSchedule;
use App\Models\Incident;
use App\Models\Trainer;
use App\Services\Notifications\NotificationIntentFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Trainer incident reporting API.
 */
class TrainerIncidentController extends Controller
{
    use BaseApiController;

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

    private function trainerScheduleIds(Request $request): array
    {
        $user = $request->user();
        if (! $user) {
            return [];
        }

        $trainer = Trainer::where('user_id', $user->id)->first();
        if (! $trainer) {
            return [];
        }

        return BookingSchedule::where('trainer_id', $trainer->id)->pluck('id')->all();
    }

    /**
     * GET /api/v1/trainer/incidents
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $incidents = Incident::where('reported_by_user_id', $user->id)
            ->with(['child:id,name', 'bookingSchedule:id,date'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn (Incident $incident) => $this->incidentToPayload($incident));

        return $this->successResponse(['incidents' => $incidents]);
    }

    /**
     * POST /api/v1/trainer/incidents
     */
    public function store(StoreTrainerIncidentRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $trainer = Trainer::where('user_id', $user->id)->first();
        if (! $trainer) {
            return $this->errorResponse('Trainer profile not found.', 'TRAINER_NOT_FOUND', [], 403);
        }

        try {
            $data = $request->validated();
            $childIds = $this->trainerChildIds($request);
            $scheduleIds = $this->trainerScheduleIds($request);

            if (! empty($data['child_id']) && ! in_array((int) $data['child_id'], $childIds, true)) {
                return $this->validationErrorResponse(['childId' => ['Selected child is not linked to your sessions.']]);
            }

            if (! empty($data['booking_schedule_id']) && ! in_array((int) $data['booking_schedule_id'], $scheduleIds, true)) {
                return $this->validationErrorResponse(['bookingScheduleId' => ['Selected session is not one of yours.']]);
            }

            $incident = Incident::create([
                'reference' => $this->generateReference(),
                'incident_type' => $data['incident_type'],
                'severity' => $data['severity'],
                'description' => $data['description'],
                'location' => $data['location'] ?? null,
                'occurred_at' => $data['occurred_at'] ?? null,
                'child_id' => $data['child_id'] ?? null,
                'booking_schedule_id' => $data['booking_schedule_id'] ?? null,
                'reported_by_user_id' => $user->id,
                'status' => Incident::STATUS_OPEN,
                'immediate_actions' => $data['immediate_actions'] ?? null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            app(INotificationDispatcher::class)->dispatch(
                NotificationIntentFactory::incidentReported($incident)
            );

            return $this->successResponse(
                ['id' => $incident->id, 'reference' => $incident->reference],
                'Your incident report has been recorded. Our Designated Safeguarding Lead will review it promptly.',
                [],
                201
            );
        } catch (\Throwable $e) {
            Log::error('Incident report submit error', [
                'user_id' => $user->id,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);

            return $this->errorResponse(
                'Something went wrong. Please try again or contact management directly.',
                \App\Http\Controllers\Api\ErrorCodes::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    private function generateReference(): string
    {
        $prefix = 'INC-' . now()->format('Ymd');
        $count = Incident::whereDate('created_at', today())->count() + 1;

        return sprintf('%s-%04d', $prefix, $count);
    }

    private function incidentToPayload(Incident $incident): array
    {
        return [
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
            'createdAt' => $incident->created_at->toIso8601String(),
        ];
    }
}
