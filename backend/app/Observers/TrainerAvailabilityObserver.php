<?php

namespace App\Observers;

use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\TrainerAvailability;
use App\Services\LiveRefreshBroadcastService;

class TrainerAvailabilityObserver
{
    public function created(TrainerAvailability $availability): void
    {
        $this->broadcastTrainerAvailabilityRefresh($availability);
    }

    public function updated(TrainerAvailability $availability): void
    {
        $this->broadcastTrainerAvailabilityRefresh($availability);
    }

    public function deleted(TrainerAvailability $availability): void
    {
        $this->broadcastTrainerAvailabilityRefresh($availability);
    }

    private function broadcastTrainerAvailabilityRefresh(TrainerAvailability $availability): void
    {
        $trainer = $availability->trainer;
        $trainerUserId = $trainer?->user_id;
        $userIds = $trainerUserId ? [$trainerUserId] : [];
        LiveRefreshBroadcastService::notify(
            [LiveRefreshController::CONTEXT_TRAINER_AVAILABILITY, LiveRefreshController::CONTEXT_TRAINER_SCHEDULES],
            array_values($userIds),
            true
        );
    }
}
