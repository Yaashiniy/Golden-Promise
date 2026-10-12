<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'name', 'icon', 'image', 'description', 'position'])]
class VendorCategory extends Model
{
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function vendors(): HasMany
    {
        return $this->hasMany(Vendor::class);
    }
}
