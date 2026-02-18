<?php

declare(strict_types=1);

namespace App\Contracts\TrainerSessionPay;

use App\Models\TrainerSessionPayment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ITrainerSessionPaymentRepository
{
    public function findById(int $id): ?TrainerSessionPayment;

    public function findByBookingScheduleId(int $bookingScheduleId): ?TrainerSessionPayment;

    /** @return Collection<int, TrainerSessionPayment> */
    public function findByTrainerId(int $trainerId, array $filters = []): Collection;

    /** @return LengthAwarePaginator<TrainerSessionPayment> */
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $data): TrainerSessionPayment;

    public function update(TrainerSessionPayment $payment, array $data): TrainerSessionPayment;
}
