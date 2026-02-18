<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\TrainerAbsenceRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Trainer absence requests: submit and list own requests.
 * Admin approval required; once approved, dates show as absence (red + scribble) on trainer calendar.
 */
class TrainerAbsenceRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $trainer = $this->resolveTrainer();
        if ($trainer instanceof JsonResponse) {
            return $trainer;
        }

        $validator = Validator::make($request->all(), [
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $dateFrom = Carbon::parse($request->date_from)->startOfDay();
        $dateTo = Carbon::parse($request->date_to)->endOfDay();

        $requests = TrainerAbsenceRequest::where('trainer_id', $trainer->id)
            ->where(function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('date_from', [$dateFrom, $dateTo])
                    ->orWhereBetween('date_to', [$dateFrom, $dateTo])
                    ->orWhere(function ($q2) use ($dateFrom, $dateTo) {
                        $q2->where('date_from', '<=', $dateFrom)->where('date_to', '>=', $dateTo);
                    });
            })
            ->orderBy('date_from')
            ->get(['id', 'date_from', 'date_to', 'status', 'reason', 'approved_at', 'created_at']);

        $approvedDates = [];
        $pendingDates = [];
        foreach ($requests as $req) {
            $start = Carbon::parse($req->date_from);
            $end = Carbon::parse($req->date_to);
            $cursor = $start->copy();
            while ($cursor->lte($end)) {
                $d = $cursor->format('Y-m-d');
                if ($cursor->between($dateFrom, $dateTo)) {
                    if ($req->status === TrainerAbsenceRequest::STATUS_APPROVED) {
                        $approvedDates[] = $d;
                    } elseif ($req->status === TrainerAbsenceRequest::STATUS_PENDING) {
                        $pendingDates[] = $d;
                    }
                }
                $cursor->addDay();
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'requests' => $requests->toArray(),
                'approved_dates' => array_values(array_unique($approvedDates)),
                'pending_dates' => array_values(array_unique($pendingDates)),
            ],
            'meta' => [
                'date_from' => $dateFrom->format('Y-m-d'),
                'date_to' => $dateTo->format('Y-m-d'),
            ],
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $trainer = $this->resolveTrainer();
        if ($trainer instanceof JsonResponse) {
            return $trainer;
        }

        $validator = Validator::make($request->all(), [
            'date_from' => ['required', 'date', 'after_or_equal:today'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $dateFrom = Carbon::parse($request->date_from)->startOfDay();
        $dateTo = Carbon::parse($request->date_to)->endOfDay();

        $maxDays = 93;
        if ($dateFrom->diffInDays($dateTo, false) > $maxDays) {
            return response()->json([
                'success' => false,
                'message' => 'Absence range must not exceed 93 days.',
            ], 422);
        }

        $absence = TrainerAbsenceRequest::create([
            'trainer_id' => $trainer->id,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'status' => TrainerAbsenceRequest::STATUS_PENDING,
            'reason' => $request->input('reason'),
        ]);

        $trainer->load('user');
        $trainerName = $trainer->user?->name ?? 'A trainer';
        $dateRange = $dateFrom->format('j M Y') . ' – ' . $dateTo->format('j M Y');
        app(\App\Contracts\Notifications\INotificationDispatcher::class)->dispatch(
            \App\Services\Notifications\NotificationIntentFactory::absenceRequestSubmitted(
                'absence_request:' . $absence->id,
                'Trainer absence request',
                sprintf('%s has requested absence from %s. Approve or reject in Absence requests.', $trainerName, $dateRange),
                '/dashboard/admin/absence-requests'
            )
        );

        return response()->json([
            'success' => true,
            'message' => 'Absence request submitted. Pending admin approval.',
            'data' => [
                'id' => $absence->id,
                'date_from' => $absence->date_from->format('Y-m-d'),
                'date_to' => $absence->date_to->format('Y-m-d'),
                'status' => $absence->status,
            ],
        ], 201);
    }

    /** @return Trainer|JsonResponse */
    private function resolveTrainer()
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $trainer = Trainer::where('user_id', $user->id)->first();
        if (! $trainer) {
            return response()->json([
                'success' => false,
                'message' => 'Trainer profile not found.',
            ], 404);
        }

        return $trainer;
    }
}
