<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable([
    'user_id', 'vendor_category_id', 'slug', 'name', 'area', 'state', 'address', 'bio',
    'experiences', 'price_from', 'rating', 'review_count',
    'instagram', 'whatsapp_phone', 'tiktok', 'facebook', 'email', 'website', 'brochure_path', 'business_type', 'is_badge_claimed', 'custom_category',
    'is_golpro', 'is_approved', 'is_verified', 'photos',
    'subscription_tier', 'subscription_expires_at',
    'languages', 'specialties', 'religion_focus',
    'response_time_hours', 'response_rate_percent', 'years_experience',
    'view_count', 'whatsapp_click_count',
    // Venue fields
    'venue_type', 'style', 'capacity', 'latitude', 'longitude', 'map_url', 'is_all_inclusive', 'also_for', 'description'
])]
class Vendor extends Model
{
    protected $casts = [
        'photos' => 'array',
        'languages' => 'array',
        'specialties' => 'array',
        'religion_focus' => 'array',
        'also_for' => 'array',
        'is_golpro' => 'boolean',
        'is_approved' => 'boolean',
        'is_verified' => 'boolean',
        'is_all_inclusive' => 'boolean',
        'rating' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected $appends = ['image', 'whatsapp_link'];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getImageAttribute(): ?string
    {
        return $this->photos[0] ?? null;
    }

    /** Build a wa.me link with a prefilled message. */
    public function getWhatsappLinkAttribute(): ?string
    {
        if (!$this->whatsapp_phone) return null;
        $phone = preg_replace('/\D/', '', $this->whatsapp_phone);
        if (!$phone) return null;
        $message = urlencode("Hi {$this->name}, I found you on Golden Promise. Are you available for my wedding?");
        return "https://wa.me/{$phone}?text={$message}";
    }

    public function getSubscriptionTierAttribute($value): string
    {
        return $value === 'golpro' ? 'elite' : $value;
    }

    public function setSubscriptionTierAttribute($value): void
    {
        $this->attributes['subscription_tier'] = $value === 'elite' ? 'golpro' : $value;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(VendorCategory::class, 'vendor_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function favorites(): MorphMany
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }
}
