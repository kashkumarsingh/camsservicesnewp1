<?php

declare(strict_types=1);

namespace App\Actions\TrainerSessionPay;

use App\Models\TrainerPayRate;

class UpsertTrainerPayRateAction
{
    public function execute(int $trainerId, array $data): TrainerPayRate
    {
        $data['trainer_id'] = $trainerId;
        $rate = new TrainerPayRate($data);
        $rate->save();
        return $rate;
    }
}
