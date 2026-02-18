<?php

declare(strict_types=1);

namespace App\Actions\TrainerSessionPay;

use App\Contracts\TrainerSessionPay\ITrainerSessionPaymentRepository;
use App\Models\TrainerSessionPayment;

class MarkTrainerSessionPaymentPaidAction
{
    public function __construct(
        private readonly ITrainerSessionPaymentRepository $repository
    ) {
    }

    public function execute(int $paymentId, int $paidByUserId, ?string $notes = null): TrainerSessionPayment
    {
        $payment = $this->repository->findById($paymentId);
        if (!$payment || !$payment->isPending()) {
            throw new \InvalidArgumentException('Payment not found or already paid.');
        }

        return $this->repository->update($payment, [
            'status' => TrainerSessionPayment::STATUS_PAID,
            'paid_at' => now(),
            'paid_by_user_id' => $paidByUserId,
            'notes' => $notes ?? $payment->notes,
        ]);
    }
}
