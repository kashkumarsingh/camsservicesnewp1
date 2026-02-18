<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\TrainerSessionPay\GetTrainerSessionPaymentAction;
use App\Actions\TrainerSessionPay\ListTrainerSessionPaymentsAction;
use App\Actions\TrainerSessionPay\MarkTrainerSessionPaymentPaidAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\TrainerSessionPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTrainerSessionPayController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ListTrainerSessionPaymentsAction $listAction,
        private readonly GetTrainerSessionPaymentAction $getAction,
        private readonly MarkTrainerSessionPaymentPaidAction $markPaidAction
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = array_filter([
            'trainer_id' => $request->query('trainer_id') ? (int) $request->query('trainer_id') : null,
            'status' => $request->query('status'),
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
        ]);
        $perPage = max(5, min($request->integer('per_page', 15), 50));
        $paginator = $this->listAction->forAdmin($filters, $perPage);
        $paginator->getCollection()->transform(function ($p) {
            return $this->formatPayment($p);
        });
        return $this->paginatedResponse($paginator);
    }

    public function show(string $id): JsonResponse
    {
        $payment = $this->getAction->execute((int) $id);
        if (!$payment) {
            return $this->notFoundResponse('Trainer session payment');
        }
        return $this->successResponse($this->formatPayment($payment));
    }

    public function markPaid(Request $request, string $id): JsonResponse
    {
        try {
            $payment = $this->markPaidAction->execute(
                (int) $id,
                (int) $request->user()->id,
                $request->input('notes')
            );
            return $this->successResponse($this->formatPayment($payment), 'Marked as paid.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 422);
        }
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
                'durationHours' => $schedule->duration_hours ? (float) $schedule->duration_hours : null,
            ] : null,
            'booking' => $booking ? ['id' => $booking->id, 'reference' => $booking->reference] : null,
            'trainerId' => $p->trainer_id,
            'trainer' => $p->relationLoaded('trainer') && $p->trainer ? [
                'id' => $p->trainer->id,
                'name' => $p->trainer->name,
            ] : null,
            'amount' => (float) $p->amount,
            'currency' => $p->currency,
            'rateTypeSnapshot' => $p->rate_type_snapshot,
            'rateAmountSnapshot' => $p->rate_amount_snapshot ? (float) $p->rate_amount_snapshot : null,
            'durationHoursUsed' => $p->duration_hours_used ? (float) $p->duration_hours_used : null,
            'status' => $p->status,
            'paidAt' => $p->paid_at ? $p->paid_at->toIso8601String() : null,
            'paidBy' => $p->relationLoaded('paidBy') && $p->paidBy ? [
                'id' => $p->paidBy->id,
                'name' => $p->paidBy->name ?? $p->paidBy->email,
            ] : null,
            'notes' => $p->notes,
            'createdAt' => $p->created_at->toIso8601String(),
        ];
    }
}
