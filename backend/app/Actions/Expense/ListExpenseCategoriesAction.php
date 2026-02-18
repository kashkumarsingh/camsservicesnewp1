<?php

declare(strict_types=1);

namespace App\Actions\Expense;

use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Collection;

class ListExpenseCategoriesAction
{
    /**
     * @return Collection<int, ExpenseCategory>
     */
    public function execute(bool $activeOnly = true): Collection
    {
        $query = ExpenseCategory::query()->orderBy('sort_order')->orderBy('name');
        if ($activeOnly) {
            $query->where('is_active', true);
        }
        return $query->get();
    }
}
