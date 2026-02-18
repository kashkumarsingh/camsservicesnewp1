<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast event for live-refresh: notifies subscribed clients that one or more
 * contexts (notifications, bookings, children, trainer_schedules, trainer_availability)
 * have changed so the frontend can refetch.
 *
 * Use LiveRefreshBroadcastService::notify() to dispatch. When Reverb/Pusher is
 * configured, Echo on the frontend receives this and triggers the same refetch
 * logic as polling; when broadcasting is disabled (log/null), nothing is sent.
 */
class LiveRefreshContextsUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Context keys that changed (e.g. ['notifications', 'bookings']).
     * Must match LiveRefreshController::CONTEXT_* and frontend LIVE_REFRESH_CONTEXTS.
     *
     * @var array<int, string>
     */
    public array $contexts;

    /**
     * User IDs to notify (each gets private channel live-refresh.{id}).
     *
     * @var array<int, int>
     */
    public array $userIds;

    /**
     * Whether to also notify all admins (they subscribe to live-refresh.admin).
     */
    public bool $notifyAdmins;

    public function __construct(array $contexts, array $userIds = [], bool $notifyAdmins = false)
    {
        $this->contexts = array_values(array_unique($contexts));
        $this->userIds = array_values(array_unique($userIds));
        $this->notifyAdmins = $notifyAdmins;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\PrivateChannel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        foreach ($this->userIds as $id) {
            $channels[] = new PrivateChannel('live-refresh.'.$id);
        }
        if ($this->notifyAdmins) {
            $channels[] = new PrivateChannel('live-refresh.admin');
        }

        return $channels;
    }

    /**
     * Event name for Echo (optional; default is full class name).
     */
    public function broadcastAs(): string
    {
        return 'LiveRefreshContextsUpdated';
    }

    /**
     * Payload sent to the client (Echo receives this).
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'contexts' => $this->contexts,
        ];
    }
}
