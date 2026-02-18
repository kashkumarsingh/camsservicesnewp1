<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\TrainerSessionPay\GetTrainerSessionPaymentAction;
use App\Actions\TrainerSessionPay\ListTrainerSessionPaymentsAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\TrainerSessionPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Trainer Session Pay Controller (trainer sees own pay)
 *
 * List own session payments and summary. Guards: auth:sanctum + trainer
 */
class TrainerSessionPayController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListTrainerSessionPaymentsAction $listAction,
        private readonly GetTrainerSessionPaymentAction $getAction
    ) {
    }

    private function getTrainerForUser(Request $request): ?Trainer
    {
        $user = $request->user();
        return $user ? Trainer::where('user_id', $user->id)->first() : null;
    }

    /**
     * GET /api/v1/trainer/session-payments
     * Query: status, from_date, to_date
     */
    public function index(Request $request): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (!$trainer) {
            return $this->errorResponse('Trainer profile not found.', null, [], 404);
        }
        $filters = array_filter([
            'status' => $request->query('status'),
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ]);
        $payments = $this->listAction->forTrainer($trainer->id, $filters);
        $list = $payments->map(function (TrainerSessionPayment $p) {
            return $this->formatPayment($p);
        });
        $pendingTotal = $payments->where('status', TrainerSessionPayment::STATUS_PENDING)->sum('amount');
        $paidTotal = $payments->where('status', TrainerSessionPayment::STATUS_PAID)->sum('amount');
        return $this->successResponse([
            'payments' => $list,
            'summary' => [
                'pendingTotal' => round((float) $pendingTotal, 2),
                'paidTotal' => round((float) $paidTotal, 2),
                'currency' => $payments->first()?->currency ?? 'GBP',
            ],
        ]);
    }

    /**
     * GET /api/v1/trainer/session-payments/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $trainer = $this->getTrainerForUser($request);
        if (!$trainer) {
            return $this->errorResponse('Trainer profile not found.', null, [], 404);
        }
        $payment = $this->getAction->execute((int) $id);
        if (!$payment || $payment->trainer_id !== $trainer->id) {
            return $this->notFoundResponse('Session payment');
        }
        return $this->successResponse($this->formatPayment($payment));
    }

    private function formatPayment(TrainerSessionPayment $p): array
    {
        $schedule = $p->relationLoaded('bookingSchedule') ? $p->bookingSchedule : null;
        $booking = $schedule && $schedule->relationLoaded('booking') ? $schedule->booking : null;
        return [
            'id' => $p->id,
            'bookingScheduleId' => $p->booking_schedule_id,
            'schedule' => $schedule ? [
                'date' => $schedule->date ? $schedule->date->format('Y-m-d') : null,
                'startTime' => $schedule->start_time,
                'endTime' => $schedule->end_time,
            ] : null,
            'bookingReference' => $booking?->reference,
            'amount' => (float) $p->amount,
            'currency' => $p->currency,
            'rateTypeSnapshot' => $p->rate_type_snapshot,
            'durationHoursUsed' => $p->duration_hours_used ? (float) $p->duration_hours_used : null,
            'status' => $p->status,
            'paidAt' => $p->paid_at ? $p->paid_at->toIso8601String() : null,
            'notes' => $p->notes,
            'createdAt' => $p->created_at->toIso8601String(),
        ];
    }
}
