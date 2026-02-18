<?php

declare(strict_types=1);

namespace App\Repositories\TrainerSessionPay;

use App\Contracts\TrainerSessionPay\ITrainerSessionPaymentRepository;
use App\Models\TrainerSessionPayment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentTrainerSessionPaymentRepository implements ITrainerSessionPaymentRepository
{
    public function findById(int $id): ?TrainerSessionPayment
    {
        return TrainerSessionPayment::with(['bookingSchedule.booking', 'trainer', 'paidBy'])->find($id);
    }

    public function findByBookingScheduleId(int $bookingScheduleId): ?TrainerSessionPayment
    {
        return TrainerSessionPayment::where('booking_schedule_id', $bookingScheduleId)->first();
    }

    public function findByTrainerId(int $trainerId, array $filters = []): Collection
    {
        $query = TrainerSessionPayment::with(['bookingSchedule.booking', 'paidBy'])
            ->where('trainer_id', $trainerId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['from_date'])) {
            $query->whereHas('bookingSchedule', fn ($q) => $q->whereDate('date', '>=', $filters['from_date']));
        }
        if (!empty($filters['to_date'])) {
            $query->whereHas('bookingSchedule', fn ($q) => $q->whereDate('date', '<=', $filters['to_date']));
        }

        return $query->orderByDesc('id')->get();
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = TrainerSessionPayment::with(['bookingSchedule.booking', 'trainer', 'paidBy']);

        if (!empty($filters['trainer_id'])) {
            $query->where('trainer_id', (int) $filters['trainer_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['from_date'])) {
            $query->whereHas('bookingSchedule', fn ($q) => $q->whereDate('date', '>=', $filters['from_date']));
        }
        if (!empty($filters['to_date'])) {
            $query->whereHas('bookingSchedule', fn ($q) => $q->whereDate('date', '<=', $filters['to_date']));
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }

    public function create(array $data): TrainerSessionPayment
    {
        return TrainerSessionPayment::create($data);
    }

    public function update(TrainerSessionPayment $payment, array $data): TrainerSessionPayment
    {
        $payment->update($data);
        return $payment->fresh();
    }
}
