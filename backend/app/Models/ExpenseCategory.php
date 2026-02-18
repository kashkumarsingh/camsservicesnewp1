<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Expense Category Model (Domain Layer)
 *
 * In-house spend management: categories for expense claims (e.g. Travel, Supplies).
 */
class ExpenseCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'limit_per_period',
        'limit_period',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'limit_per_period' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'expense_category_id');
    }
}
