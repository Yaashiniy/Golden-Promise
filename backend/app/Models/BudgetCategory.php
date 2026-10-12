<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id', 'name', 'icon', 'color',
    'estimated', 'avg_min', 'avg_max', 'position', 'is_ai_generated',
])]
class BudgetCategory extends Model
{
    protected $casts = [
        'is_ai_generated' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(BudgetExpense::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BudgetItem::class);
    }
}
