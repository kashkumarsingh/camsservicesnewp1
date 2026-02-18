<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class GetExpenseAnalyticsAction
{
    /**
     * @return array{
     *   totalByStatus: array{pending: float, approved: float, rejected: float},
     *   byCategory: array<int, array{id: int, name: string, slug: string, count: int, total: float}>,
     *   byMonth: array<int, array{month: string, year: int, count: int, total: float}>
     * }
     */
    public function execute(?string $fromDate = null, ?string $toDate = null): array
    {
        $from = $fromDate ? Carbon::parse($fromDate)->startOfDay() : now()->startOfYear();
        $to = $toDate ? Carbon::parse($toDate)->endOfDay() : now()->endOfDay();

        $query = Expense::query()
            ->whereDate('expense_date', '>=', $from)
            ->whereDate('expense_date', '<=', $to);

        $totalByStatus = [
            'pending' => (float) (clone $query)->where('status', Expense::STATUS_PENDING)->sum('amount'),
            'approved' => (float) (clone $query)->where('status', Expense::STATUS_APPROVED)->sum('amount'),
            'rejected' => (float) (clone $query)->where('status', Expense::STATUS_REJECTED)->sum('amount'),
        ];

        $byCategory = Expense::query()
            ->whereDate('expense_date', '>=', $from)
            ->whereDate('expense_date', '<=', $to)
            ->selectRaw('expense_category_id, COUNT(*) as count, COALESCE(SUM(amount), 0) as total')
            ->groupBy('expense_category_id')
            ->get();

        $categories = ExpenseCategory::whereIn('id', $byCategory->pluck('expense_category_id'))->get()->keyBy('id');
        $byCategoryArray = $byCategory->map(function ($row) use ($categories) {
            $cat = $categories->get($row->expense_category_id);
            return [
                'id' => $row->expense_category_id,
                'name' => $cat ? $cat->name : 'Unknown',
                'slug' => $cat ? $cat->slug : '',
                'count' => (int) $row->count,
                'total' => round((float) $row->total, 2),
            ];
        })->values()->all();

        $byMonthRows = Expense::query()
            ->whereDate('expense_date', '>=', $from)
            ->whereDate('expense_date', '<=', $to)
            ->get(['expense_date', 'amount']);
        $byMonthGrouped = $byMonthRows->groupBy(fn (Expense $e) => $e->expense_date->format('Y-m'));
        $byMonthArray = $byMonthGrouped->map(function (EloquentCollection $items, string $ym) {
            return [
                'month' => $ym,
                'year' => (int) substr($ym, 0, 4),
                'count' => $items->count(),
                'total' => round((float) $items->sum('amount'), 2),
            ];
        })->values()->sortBy('month')->values()->all();

        return [
            'fromDate' => $from->toDateString(),
            'toDate' => $to->toDateString(),
            'totalByStatus' => $totalByStatus,
            'byCategory' => $byCategoryArray,
            'byMonth' => $byMonthArray,
        ];
    }
}
