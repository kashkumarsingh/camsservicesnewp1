<?php

namespace App\Services\Compliance;

use App\Models\LocalAuthorityAgreement;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Local authority agreement attention items (unsigned drafts, expiring agreements).
 */
class LaAgreementAttentionService
{
    public const WARNING_DAYS = 30;

    public function warningCutoff(): Carbon
    {
        return Carbon::today()->addDays(self::WARNING_DAYS);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function attentionRecords(): Collection
    {
        $today = Carbon::today();
        $cutoff = $this->warningCutoff();

        return LocalAuthorityAgreement::query()
            ->orderBy('local_authority_name')
            ->get()
            ->map(function (LocalAuthorityAgreement $agreement) use ($today, $cutoff) {
                $reasons = [];

                if ($agreement->status === LocalAuthorityAgreement::STATUS_DRAFT) {
                    $reasons[] = 'draft';
                } elseif ($agreement->status === LocalAuthorityAgreement::STATUS_ACTIVE && ! $agreement->hasSignedDocument()) {
                    $reasons[] = 'unsigned';
                }

                if ($agreement->expires_at !== null) {
                    if ($agreement->expires_at->lt($today)) {
                        $reasons[] = 'expired';
                    } elseif ($agreement->expires_at->lte($cutoff)) {
                        $reasons[] = 'expiring_soon';
                    }
                }

                if ($reasons === []) {
                    return null;
                }

                return [
                    'id' => (string) $agreement->id,
                    'localAuthorityName' => $agreement->local_authority_name,
                    'status' => $agreement->status,
                    'expiresAt' => $agreement->expires_at?->format('Y-m-d'),
                    'hasSignedDocument' => $agreement->hasSignedDocument(),
                    'reasons' => $reasons,
                    'primaryReason' => $reasons[0],
                ];
            })
            ->filter()
            ->sort(function (array $a, array $b) {
                $priority = fn (string $reason) => match ($reason) {
                    'expired' => 0,
                    'unsigned' => 1,
                    'expiring_soon' => 2,
                    'draft' => 3,
                    default => 4,
                };

                return $priority($a['primaryReason']) <=> $priority($b['primaryReason']);
            })
            ->values();
    }

    /**
     * @return array{count: int, records: array<int, array<string, mixed>>}
     */
    public function attentionSummary(): array
    {
        $records = $this->attentionRecords()->values()->all();

        return [
            'count' => count($records),
            'records' => array_slice($records, 0, 15),
        ];
    }
}
