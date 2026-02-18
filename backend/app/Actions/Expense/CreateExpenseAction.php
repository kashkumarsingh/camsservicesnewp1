<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Contracts\Expense\IExpenseRepository;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Carbon\Carbon;

class CreateExpenseAction
{
    public function __construct(
        private readonly IExpenseRepository $expenseRepository
    ) {
    }

    /**
     * @param array $data expense_category_id, amount, expense_date, title, ...
     * @param string|null $limitOverrideReason If set (admin only), skip category spend limit check.
     */
    public function execute(int $userId, array $data, ?string $limitOverrideReason = null): Expense
    {
        $category = ExpenseCategory::where('id', $data['expense_category_id'])->where('is_active', true)->firstOrFail();

        $amount = (float) $data['amount'];
        $expenseDate = $data['expense_date'] instanceof \Carbon\Carbon
            ? $data['expense_date']
            : Carbon::parse($data['expense_date']);

        if ($limitOverrideReason === null && $category->limit_per_period !== null && $category->limit_period) {
            $this->assertWithinCategoryLimit($userId, $category, $expenseDate, $amount);
        }

        $payload = [
            'user_id' => $userId,
            'expense_category_id' => $category->id,
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'GBP',
            'expense_date' => $data['expense_date'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'receipt_path' => $data['receipt_path'] ?? null,
            'status' => Expense::STATUS_PENDING,
            'metadata' => $data['metadata'] ?? null,
        ];

        return $this->expenseRepository->create($payload);
    }

    private function assertWithinCategoryLimit(int $userId, ExpenseCategory $category, Carbon $expenseDate, float $newAmount): void
    {
        $period = strtolower($category->limit_period);
        if ($period === 'monthly') {
            $from = $expenseDate->copy()->startOfMonth();
            $to = $expenseDate->copy()->endOfMonth();
        } elseif ($period === 'yearly') {
            $from = $expenseDate->copy()->startOfYear();
            $to = $expenseDate->copy()->endOfYear();
        } else {
            return;
        }

        $existingSum = (float) Expense::query()
            ->where('user_id', $userId)
            ->where('expense_category_id', $category->id)
            ->whereIn('status', [Expense::STATUS_PENDING, Expense::STATUS_APPROVED])
            ->whereDate('expense_date', '>=', $from)
            ->whereDate('expense_date', '<=', $to)
            ->sum('amount');

        $limit = (float) $category->limit_per_period;
        if ($existingSum + $newAmount > $limit) {
            throw new \DomainException(sprintf(
                'Category "%s" spend limit for this period is %s. Current total: %s. This expense would exceed the limit.',
                $category->name,
                number_format($limit, 2),
                number_format($existingSum, 2)
            ));
        }
    }
}
