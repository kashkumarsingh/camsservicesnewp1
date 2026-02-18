<?php

namespace App\Http\Controllers\Api;

use App\Actions\TrainerAvailability\GetTrainerAvailabilityDatesAction;
use App\Actions\TrainerAvailability\SetTrainerAvailabilityDatesAction;
use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Trainer availability by calendar dates (single or multi select).
 * Delegates to GetTrainerAvailabilityDatesAction / SetTrainerAvailabilityDatesAction (single source of truth).
 * Trainers set availability only on the dashboard calendar.
 *
 * @see \App\Actions\TrainerAvailability\GetTrainerAvailabilityDatesAction
 * @see \App\Actions\TrainerAvailability\SetTrainerAvailabilityDatesAction
 */
class TrainerAvailabilityDatesController extends Controller
{
    public function __construct(
        private readonly GetTrainerAvailabilityDatesAction $getDates,
        private readonly SetTrainerAvailabilityDatesAction $setDates
    ) {
    }

    /**
     * Get dates when the authenticated trainer is available/unavailable in a range.
     * GET /api/v1/trainer/availability-dates?date_from=Y-m-d&date_to=Y-m-d
     */
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

        $result = $this->getDates->execute(
            (int) $trainer->id,
            Carbon::parse($request->date_from),
            Carbon::parse($request->date_to)
        );

        return response()->json([
            'success' => true,
            'data' => [
                'dates' => $result['dates'],
                'unavailable_dates' => $result['unavailable_dates'],
            ],
            'meta' => [
                'date_from' => $result['date_from'],
                'date_to' => $result['date_to'],
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * Set availability for the given dates in a range. Replaces existing specific-date
     * availability in that range with the provided dates.
     * PUT /api/v1/trainer/availability-dates
     * Body: { "date_from": "Y-m-d", "date_to": "Y-m-d", "dates": ["Y-m-d", ...], "unavailable_dates": ["Y-m-d", ...] }
     */
    public function update(Request $request): JsonResponse
    {
        $trainer = $this->resolveTrainer();
        if ($trainer instanceof JsonResponse) {
            return $trainer;
        }

        $validator = Validator::make($request->all(), [
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
            'dates' => ['present', 'array'],
            'dates.*' => ['date', 'date_format:Y-m-d'],
            'unavailable_dates' => ['nullable', 'array'],
            'unavailable_dates.*' => ['date', 'date_format:Y-m-d'],
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = $this->setDates->execute(
                (int) $trainer->id,
                Carbon::parse($request->date_from),
                Carbon::parse($request->date_to),
                $request->input('dates', []),
                $request->input('unavailable_dates', [])
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' => 'Availability updated.',
            'data' => [
                'dates' => $result['dates'],
                'unavailable_dates' => $result['unavailable_dates'],
            ],
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'version' => 'v1',
            ],
        ], 200);
    }

    /**
     * @return Trainer|JsonResponse
     */
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
                'message' => 'Trainer profile not found. Please contact admin.',
            ], 404);
        }

        return $trainer;
    }
}
