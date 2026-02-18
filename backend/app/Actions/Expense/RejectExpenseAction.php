<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Contracts\Expense\IExpenseRepository;
use App\Models\Expense;

class RejectExpenseAction
{
    public function __construct(
        private readonly IExpenseRepository $expenseRepository
    ) {
    }

    public function execute(int $expenseId, int $rejectedByUserId, string $reason): Expense
    {
        $expense = $this->expenseRepository->findById($expenseId);
        if (!$expense || !$expense->isPending()) {
            throw new \InvalidArgumentException('Expense not found or not pending.');
        }

        return $this->expenseRepository->update($expense, [
            'status' => Expense::STATUS_REJECTED,
            'approved_by_id' => $rejectedByUserId,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }
}
