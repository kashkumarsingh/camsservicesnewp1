<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Contracts\Expense\IExpenseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ListExpensesAction
{
    public function __construct(
        private readonly IExpenseRepository $expenseRepository
    ) {
    }

    /**
     * List expenses for a user (own expenses).
     *
     * @return Collection<int, \App\Models\Expense>
     */
    public function forUser(int $userId, array $filters = []): Collection
    {
        return $this->expenseRepository->findByUserId($userId, $filters);
    }

    /**
     * Paginated list for admin (all expenses).
     *
     * @return LengthAwarePaginator<\App\Models\Expense>
     */
    public function forAdmin(array $filters = [], int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return $this->expenseRepository->paginateForAdmin($filters, $perPage, $page);
    }
}
