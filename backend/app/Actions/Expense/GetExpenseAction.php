<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Contracts\Expense\IExpenseRepository;
use App\Models\Expense;

class GetExpenseAction
{
    public function __construct(
        private readonly IExpenseRepository $expenseRepository
    ) {
    }

    public function execute(int $id): ?Expense
    {
        return $this->expenseRepository->findById($id);
    }
}
