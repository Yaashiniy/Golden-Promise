<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'reference', 'applicant_name', 'email', 'phone',
    'business_name', 'business_address', 'city', 'state', 'postcode', 'vendor_category_id', 'business_type',
    'ssm_number', 'ssm_doc_path', 'business_license_doc_path', 'nric_or_passport_doc_path',
    'bank_name', 'bank_account_number', 'bank_account_holder',
    'bio', 'specialties', 'languages', 'religion_focus',
    'price_from', 'years_experience', 'instagram', 'website', 'portfolio_urls',
    'subscription_tier_requested', 'payment_proof_path',
    'status', 'rejection_reason', 'ai_rejection_reason', 'reviewed_by_user_id', 'reviewed_at', 'admin_notes',
    'amendment_changes', 'amendment_submitted_at',
    'created_user_id', 'created_vendor_id',
])]
class VendorApplication extends Model
{
    protected $casts = [
        'specialties' => 'array',
        'languages' => 'array',
        'religion_focus' => 'array',
        'portfolio_urls' => 'array',
        'amendment_changes' => 'array',
        'amendment_submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(VendorCategory::class, 'vendor_category_id');
    }
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_user_id');
    }
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'created_vendor_id');
    }
}
