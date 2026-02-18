<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Contracts\Expense\IExpenseRepository;
use App\Models\Expense;

class ApproveExpenseAction
{
    public function __construct(
        private readonly IExpenseRepository $expenseRepository
    ) {
    }

    public function execute(int $expenseId, int $approvedByUserId): Expense
    {
        $expense = $this->expenseRepository->findById($expenseId);
        if (!$expense || !$expense->isPending()) {
            throw new \InvalidArgumentException('Expense not found or not pending.');
        }

        return $this->expenseRepository->update($expense, [
            'status' => Expense::STATUS_APPROVED,
            'approved_by_id' => $approvedByUserId,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);
    }
}
