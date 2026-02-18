<?php

declare(strict_types=1);

namespace App\Contracts\Expense;

use App\Models\Expense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Expense Repository Interface
 *
 * Clean Architecture: Domain port for expense data access.
 */
interface IExpenseRepository
{
    public function findById(int $id): ?Expense;

    /** @return Collection<int, Expense> */
    public function findByUserId(int $userId, array $filters = []): Collection;

    /** @return LengthAwarePaginator<Expense> */
    public function paginateForAdmin(array $filters = [], int $perPage = 15, int $page = 1): LengthAwarePaginator;

    public function create(array $data): Expense;

    public function update(Expense $expense, array $data): Expense;
}
