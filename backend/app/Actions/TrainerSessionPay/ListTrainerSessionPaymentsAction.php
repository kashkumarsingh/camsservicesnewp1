<?php

declare(strict_types=1);

namespace App\Actions\TrainerSessionPay;

use App\Contracts\TrainerSessionPay\ITrainerSessionPaymentRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ListTrainerSessionPaymentsAction
{
    public function __construct(
        private readonly ITrainerSessionPaymentRepository $repository
    ) {
    }

    /** @return Collection<int, \App\Models\TrainerSessionPayment> */
    public function forTrainer(int $trainerId, array $filters = []): Collection
    {
        return $this->repository->findByTrainerId($trainerId, $filters);
    }

    /** @return LengthAwarePaginator<\App\Models\TrainerSessionPayment> */
    public function forAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginateForAdmin($filters, $perPage);
    }
}
