<?php

declare(strict_types=1);

namespace App\Actions\TrainerSessionPay;

use App\Contracts\TrainerSessionPay\ITrainerSessionPaymentRepository;
use App\Models\TrainerSessionPayment;

class GetTrainerSessionPaymentAction
{
    public function __construct(
        private readonly ITrainerSessionPaymentRepository $repository
    ) {
    }

    public function execute(int $id): ?TrainerSessionPayment
    {
        return $this->repository->findById($id);
    }
}
