<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'title', 'section', 'due_date', 'is_completed', 'position', 'is_ai_generated'])]
class ChecklistItem extends Model
{
    protected $casts = [
        'is_completed' => 'boolean',
        'is_ai_generated' => 'boolean',
        'due_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
