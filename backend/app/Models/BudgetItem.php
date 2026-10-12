<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'budget_category_id', 'name', 'source_type', 'source_id', 'source_slug',
    'image', 'estimated', 'actual_cost', 'paid_amount', 'paid', 'payment_due_date',
    'notes', 'is_shortlisted', 'position',
])]
class BudgetItem extends Model
{
    protected $casts = [
        'is_shortlisted' => 'boolean',
        'paid' => 'boolean',
        'payment_due_date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class, 'budget_category_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'source_id');
    }
}
