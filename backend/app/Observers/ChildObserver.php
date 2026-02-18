<?php

namespace App\Observers;

use App\Http\Controllers\Api\LiveRefreshController;
use App\Models\Child;
use App\Services\LiveRefreshBroadcastService;

class ChildObserver
{
    public function created(Child $child): void
    {
        $this->broadcastChildrenRefresh($child);
    }

    public function updated(Child $child): void
    {
        $this->broadcastChildrenRefresh($child);
    }

    public function deleted(Child $child): void
    {
        $this->broadcastChildrenRefresh($child);
    }

    private function broadcastChildrenRefresh(Child $child): void
    {
        $userIds = array_filter([$child->user_id]);
        LiveRefreshBroadcastService::notify(
            [LiveRefreshController::CONTEXT_CHILDREN],
            array_values($userIds),
            true
        );
    }
}
