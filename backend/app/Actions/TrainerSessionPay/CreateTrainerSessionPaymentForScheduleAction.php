<?php

declare(strict_types=1);

namespace App\Actions\TrainerSessionPay;

use App\Contracts\TrainerSessionPay\ITrainerSessionPaymentRepository;
use App\Models\BookingSchedule;
use App\Models\TrainerPayRate;
use App\Models\TrainerSessionPayment;
use Illuminate\Support\Facades\Log;

/**
 * Creates a pending TrainerSessionPayment when a session is completed.
 * Idempotent: no duplicate if one already exists for the schedule.
 */
class CreateTrainerSessionPaymentForScheduleAction
{
    public function __construct(
        private readonly ITrainerSessionPaymentRepository $repository
    ) {
    }

    public function execute(BookingSchedule $schedule): ?TrainerSessionPayment
    {
        if ($schedule->status !== BookingSchedule::STATUS_COMPLETED || !$schedule->trainer_id) {
            return null;
        }

        $existing = $this->repository->findByBookingScheduleId($schedule->id);
        if ($existing) {
            return $existing;
        }

        $rate = TrainerPayRate::where('trainer_id', $schedule->trainer_id)->active()->latest('effective_from')->first();
        $durationHours = (float) ($schedule->actual_duration_hours ?? $schedule->duration_hours ?? 0);

        $amount = 0.0;
        $rateType = null;
        $rateAmount = null;

        if ($rate) {
            $rateType = $rate->rate_type;
            $rateAmount = (float) $rate->amount;
            if ($rate->isHourly()) {
                $amount = round($rateAmount * $durationHours, 2);
            } else {
                $amount = $rateAmount;
            }
        }

        $currency = $rate ? ($rate->currency ?? 'GBP') : 'GBP';

        try {
            return $this->repository->create([
                'booking_schedule_id' => $schedule->id,
                'trainer_id' => $schedule->trainer_id,
                'amount' => $amount,
                'currency' => $currency,
                'rate_type_snapshot' => $rateType,
                'rate_amount_snapshot' => $rateAmount,
                'duration_hours_used' => $durationHours,
                'status' => TrainerSessionPayment::STATUS_PENDING,
                'notes' => !$rate ? 'No pay rate configured for trainer.' : null,
            ]);
        } catch (\Exception $e) {
            Log::error('CreateTrainerSessionPaymentForScheduleAction failed', [
                'booking_schedule_id' => $schedule->id,
                'trainer_id' => $schedule->trainer_id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
