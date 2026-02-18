<?php

declare(strict_types=1);

namespace App\Repositories\Expense;

use App\Contracts\Expense\IExpenseRepository;
use App\Models\Expense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentExpenseRepository implements IExpenseRepository
{
    public function findById(int $id): ?Expense
    {
        return Expense::with(['user', 'expenseCategory', 'approvedBy'])->find($id);
    }

    /** @return Collection<int, Expense> */
    public function findByUserId(int $userId, array $filters = []): Collection
    {
        $query = Expense::with(['expenseCategory', 'approvedBy'])
            ->where('user_id', $userId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['expense_category_id'])) {
            $query->where('expense_category_id', (int) $filters['expense_category_id']);
        }
        if (!empty($filters['from_date'])) {
            $query->whereDate('expense_date', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('expense_date', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('expense_date')->orderByDesc('id')->get();
    }

    /** @return LengthAwarePaginator<Expense> */
    public function paginateForAdmin(array $filters = [], int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $query = Expense::with(['user', 'expenseCategory', 'approvedBy']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['user_id'])) {
            $query->where('user_id', (int) $filters['user_id']);
        }
        if (!empty($filters['expense_category_id'])) {
            $query->where('expense_category_id', (int) $filters['expense_category_id']);
        }
        if (!empty($filters['from_date'])) {
            $query->whereDate('expense_date', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('expense_date', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('expense_date')->orderByDesc('id')->paginate($perPage, ['*'], 'page', $page);
    }

    public function create(array $data): Expense
    {
        return Expense::create($data);
    }

    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);
        return $expense->fresh();
    }
}
