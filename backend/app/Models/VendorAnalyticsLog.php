<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorAnalyticsLog extends Model
{
    protected $fillable = ['vendor_id', 'event_type', 'visitor_area'];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
