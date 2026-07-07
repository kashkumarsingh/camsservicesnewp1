<?php

namespace App\Services\Compliance;

use App\Models\Staff;
use App\Models\Trainer;
use App\Models\TrainerApplication;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * DBS expiry checks aligned with the DBS Checking and Management Procedure (30-day warning).
 */
class DbsExpiryService
{
    public const WARNING_DAYS = 30;

    public const STATUS_VALID = 'valid';

    public const STATUS_EXPIRING_SOON = 'expiring_soon';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_MISSING = 'missing';

    public const STATUS_UNKNOWN = 'unknown';

    public function warningCutoff(): Carbon
    {
        return Carbon::today()->addDays(self::WARNING_DAYS);
    }

    /**
     * @return self::STATUS_*|null null when no expiry date provided
     */
    public function statusForExpiry(?Carbon $expiresAt, bool $hasDbsCheck = true): ?string
    {
        if (! $hasDbsCheck && $expiresAt === null) {
            return self::STATUS_MISSING;
        }

        if ($expiresAt === null) {
            return $hasDbsCheck ? self::STATUS_UNKNOWN : self::STATUS_MISSING;
        }

        $today = Carbon::today();

        if ($expiresAt->lt($today)) {
            return self::STATUS_EXPIRED;
        }

        if ($expiresAt->lte($this->warningCutoff())) {
            return self::STATUS_EXPIRING_SOON;
        }

        return self::STATUS_VALID;
    }

    public function needsAttention(?string $status): bool
    {
        return in_array($status, [self::STATUS_EXPIRED, self::STATUS_EXPIRING_SOON, self::STATUS_MISSING], true);
    }

    public function daysUntilExpiry(?Carbon $expiresAt): ?int
    {
        if ($expiresAt === null) {
            return null;
        }

        return (int) Carbon::today()->diffInDays($expiresAt, false);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function staffRecords(bool $attentionOnly = true): Collection
    {
        $query = Staff::query()
            ->where('employment_status', 'active');

        // Staff model - check constant
        $staff = $query->orderBy('name')->get();

        return $staff->map(function (Staff $member) {
            $status = $this->statusForExpiry(
                $member->dbs_expires_at ? Carbon::parse($member->dbs_expires_at) : null,
                (bool) $member->has_dbs_check
            );

            return [
                'kind' => 'staff',
                'id' => (string) $member->id,
                'name' => $member->name,
                'roleLabel' => $member->job_title,
                'hasDbsCheck' => (bool) $member->has_dbs_check,
                'dbsExpiresAt' => $member->dbs_expires_at?->format('Y-m-d'),
                'dbsStatus' => $status,
                'daysUntilExpiry' => $this->daysUntilExpiry($member->dbs_expires_at ? Carbon::parse($member->dbs_expires_at) : null),
            ];
        })->filter(fn (array $row) => ! $attentionOnly || $this->needsAttention($row['dbsStatus']))
            ->values();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function trainerRecords(bool $attentionOnly = true): Collection
    {
        $trainers = Trainer::query()
            ->where('is_active', true)
            ->with(['user:id,email'])
            ->orderBy('name')
            ->get();

        if ($trainers->isEmpty()) {
            return collect();
        }

        $appsByTrainer = TrainerApplication::query()
            ->whereIn('trainer_id', $trainers->pluck('id'))
            ->where('status', TrainerApplication::STATUS_APPROVED)
            ->orderByDesc('reviewed_at')
            ->orderByDesc('updated_at')
            ->get()
            ->unique('trainer_id')
            ->keyBy('trainer_id');

        return $trainers->map(function (Trainer $trainer) use ($appsByTrainer) {
            $app = $appsByTrainer->get($trainer->id);
            $expiresAt = $app?->dbs_expires_at ? Carbon::parse($app->dbs_expires_at) : null;
            $hasDbs = (bool) ($app?->has_dbs_check ?? false);
            $status = $this->statusForExpiry($expiresAt, $hasDbs);

            return [
                'kind' => 'trainer',
                'id' => (string) $trainer->id,
                'name' => $trainer->name,
                'roleLabel' => $trainer->role ?? 'Trainer',
                'hasDbsCheck' => $hasDbs,
                'dbsExpiresAt' => $expiresAt?->format('Y-m-d'),
                'dbsStatus' => $status,
                'daysUntilExpiry' => $this->daysUntilExpiry($expiresAt),
                'trainerApplicationId' => $app ? (string) $app->id : null,
            ];
        })->filter(fn (array $row) => ! $attentionOnly || $this->needsAttention($row['dbsStatus']))
            ->values();
    }

    /**
     * @return array{count: int, records: array<int, array<string, mixed>>}
     */
    public function attentionSummary(): array
    {
        $records = $this->staffRecords(true)
            ->merge($this->trainerRecords(true))
            ->sort(function (array $a, array $b) {
                $priority = fn (string $status) => match ($status) {
                    self::STATUS_EXPIRED => 0,
                    self::STATUS_EXPIRING_SOON => 1,
                    self::STATUS_MISSING => 2,
                    default => 3,
                };
                $cmp = $priority($a['dbsStatus'] ?? '') <=> $priority($b['dbsStatus'] ?? '');
                if ($cmp !== 0) {
                    return $cmp;
                }

                return ($a['daysUntilExpiry'] ?? 9999) <=> ($b['daysUntilExpiry'] ?? 9999);
            })
            ->values()
            ->all();

        return [
            'count' => count($records),
            'records' => array_slice($records, 0, 20),
        ];
    }
}
