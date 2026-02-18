<?php

declare(strict_types=1);

namespace App\Actions\TrainerSessionPay;

use App\Models\TrainerPayRate;
use Illuminate\Database\Eloquent\Collection;

class GetTrainerPayRateAction
{
    /** @return Collection<int, TrainerPayRate> */
    public function forTrainer(int $trainerId, bool $activeOnly = true): Collection
    {
        $query = TrainerPayRate::where('trainer_id', $trainerId)->orderByDesc('effective_from');
        if ($activeOnly) {
            $query->active();
        }
        return $query->get();
    }

    public function currentForTrainer(int $trainerId): ?TrainerPayRate
    {
        return TrainerPayRate::where('trainer_id', $trainerId)->active()->latest('effective_from')->first();
    }
}
