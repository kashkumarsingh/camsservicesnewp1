<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Child;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin global quick search.
 *
 * GET /api/v1/admin/search?q=...
 * Returns grouped results: parents, children, trainers, bookings (each limited to 5).
 */
class AdminSearchController extends Controller
{
    use BaseApiController;

    private const LIMIT_PER_GROUP = 5;

    public function index(Request $request): JsonResponse
    {
        $q = $request->query('q');
        $q = is_string($q) ? trim($q) : '';
        if ($q === '') {
            return $this->successResponse([
                'parents' => [],
                'children' => [],
                'trainers' => [],
                'bookings' => [],
            ]);
        }

        $term = '%' . $q . '%';

        $parents = User::query()
            ->where('role', 'parent')
            ->where(function ($query) use ($term) {
                $query->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            })
            ->orderBy('name')
            ->limit(self::LIMIT_PER_GROUP)
            ->get()
            ->map(fn (User $u) => [
                'id' => (string) $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ]);

        $children = Child::query()
            ->with('user')
            ->where('name', 'like', $term)
            ->orderBy('name')
            ->limit(self::LIMIT_PER_GROUP)
            ->get()
            ->map(fn (Child $c) => [
                'id' => (string) $c->id,
                'name' => $c->name,
                'parentName' => $c->user?->name,
            ]);

        $trainers = Trainer::query()
            ->where('name', 'like', $term)
            ->orderBy('name')
            ->limit(self::LIMIT_PER_GROUP)
            ->get()
            ->map(fn (Trainer $t) => [
                'id' => (string) $t->id,
                'name' => $t->name,
            ]);

        $bookings = Booking::query()
            ->where('reference', 'like', $term)
            ->orderByDesc('created_at')
            ->limit(self::LIMIT_PER_GROUP)
            ->get()
            ->map(fn (Booking $b) => [
                'id' => (string) $b->id,
                'reference' => $b->reference,
                'status' => $b->status,
            ]);

        $data = [
            'parents' => $this->keysToCamelCase($parents->toArray()),
            'children' => $this->keysToCamelCase($children->toArray()),
            'trainers' => $this->keysToCamelCase($trainers->toArray()),
            'bookings' => $this->keysToCamelCase($bookings->toArray()),
        ];

        return $this->successResponse($data);
    }
}
