<?php

namespace App\Observers;

use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\TrainerAbsenceRequest;
use App\Services\LiveRefreshBroadcastService;

class TrainerAbsenceRequestObserver
{
    public function created(TrainerAbsenceRequest $request): void
    {
        $this->broadcastTrainerAvailabilityRefresh($request);
    }

    public function updated(TrainerAbsenceRequest $request): void
    {
        $this->broadcastTrainerAvailabilityRefresh($request);
    }

    public function deleted(TrainerAbsenceRequest $request): void
    {
        $this->broadcastTrainerAvailabilityRefresh($request);
    }

    private function broadcastTrainerAvailabilityRefresh(TrainerAbsenceRequest $request): void
    {
        $trainer = $request->trainer;
        $trainerUserId = $trainer?->user_id;
        $userIds = $trainerUserId ? [$trainerUserId] : [];
        LiveRefreshBroadcastService::notify(
            [LiveRefreshController::CONTEXT_TRAINER_AVAILABILITY, LiveRefreshController::CONTEXT_TRAINER_SCHEDULES],
            array_values($userIds),
            true
        );
    }
}
