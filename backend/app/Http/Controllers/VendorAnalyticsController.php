<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VendorAnalyticsController extends Controller
{
    /** Vendor's own dashboard analytics + profile edit endpoints live here. */
    public function stats(Request $request)
    {
        $vendor = $request->user()->vendor;
        if (!$vendor) return response()->json(['message' => 'No vendor profile linked.'], 404);

        $range = $request->query('range', 'all'); // '7d', '30d', 'all'
        
        $query = \App\Models\VendorAnalyticsLog::where('vendor_id', $vendor->id);
        
        if ($range === '7d') {
            $query->where('created_at', '>=', now()->subDays(7));
            $prevQuery = \App\Models\VendorAnalyticsLog::where('vendor_id', $vendor->id)
                ->where('created_at', '>=', now()->subDays(14))
                ->where('created_at', '<', now()->subDays(7));
        } elseif ($range === '30d') {
            $query->where('created_at', '>=', now()->subDays(30));
            $prevQuery = \App\Models\VendorAnalyticsLog::where('vendor_id', $vendor->id)
                ->where('created_at', '>=', now()->subDays(60))
                ->where('created_at', '<', now()->subDays(30));
        } else {
            $prevQuery = collect([]);
        }

        $logs = $query->get();
        $prevLogs = $range === 'all' ? collect([]) : $prevQuery->get();

        $viewCount = $logs->where('event_type', 'view')->count();
        $whatsappCount = $logs->where('event_type', 'click_whatsapp')->count();
        $tiktokCount = $logs->where('event_type', 'click_tiktok')->count();
        $facebookCount = $logs->where('event_type', 'click_facebook')->count();
        
        $totalSocialClicks = $logs->filter(fn($l) => str_starts_with($l->event_type, 'click_'))->count();

        // If 'all' is selected and there are no logs (since we just migrated), fallback to legacy columns
        if ($range === 'all' && $logs->isEmpty()) {
            $viewCount = (int) $vendor->view_count;
            $whatsappCount = (int) $vendor->whatsapp_click_count;
            $totalSocialClicks = $whatsappCount;
        }

        // Group by day for the chart
        $chartData = $logs->groupBy(fn($l) => $l->created_at->format('Y-m-d'))->map(function ($dayLogs, $date) {
            return [
                'date' => $date,
                'views' => $dayLogs->where('event_type', 'view')->count(),
                'clicks' => $dayLogs->filter(fn($l) => str_starts_with($l->event_type, 'click_'))->count(),
            ];
        })->values()->sortBy('date')->values();

        $prevViewCount = $prevLogs->where('event_type', 'view')->count();
        $prevTotalSocialClicks = $prevLogs->filter(fn($l) => str_starts_with($l->event_type, 'click_'))->count();
        $prevCtr = $prevViewCount > 0 ? round(($prevTotalSocialClicks / $prevViewCount) * 100, 1) : 0;

        $ctr = $viewCount > 0 ? round(($totalSocialClicks / $viewCount) * 100, 1) : 0;

        $viewTrend = $prevViewCount > 0 ? round((($viewCount - $prevViewCount) / $prevViewCount) * 100, 1) : ($viewCount > 0 ? 100 : 0);
        $clicksTrend = $prevTotalSocialClicks > 0 ? round((($totalSocialClicks - $prevTotalSocialClicks) / $prevTotalSocialClicks) * 100, 1) : ($totalSocialClicks > 0 ? 100 : 0);
        $ctrTrend = $prevCtr > 0 ? round((($ctr - $prevCtr) / $prevCtr) * 100, 1) : ($ctr > 0 ? 100 : 0);

        // --- NEW FEATURES ---

        // 1. Favorites / Saves
        $favoritesCount = $vendor->favorites()->count();

        // 2. Profile Completeness Score
        $completenessScore = 20; // Base score for having an account
        if (!empty($vendor->bio)) $completenessScore += 20;
        if (!empty($vendor->whatsapp_phone)) $completenessScore += 15;
        if (!empty($vendor->area) && !empty($vendor->state)) $completenessScore += 15;
        $photoCount = is_array($vendor->photos) ? count($vendor->photos) : 0;
        if ($photoCount > 0) $completenessScore += 10;
        if ($photoCount >= 3) $completenessScore += 10; // Extra points for 3+ photos
        if (!empty($vendor->instagram) || !empty($vendor->facebook) || !empty($vendor->tiktok)) $completenessScore += 10;
        $completenessScore = min(100, $completenessScore); // Cap at 100%

        // 3. Recent Activity Log (latest 5 events)
        $recentActivity = \App\Models\VendorAnalyticsLog::where('vendor_id', $vendor->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'type' => $log->event_type, // 'view', 'click_whatsapp', etc.
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            });

        // 4. Photo Limits Usage
        $tier = $vendor->subscription_tier;
        $maxPhotos = 3; // Free
        if ($tier === 'premium') $maxPhotos = 10;
        elseif ($tier === 'elite' || $tier === 'golpro') $maxPhotos = 25;
        
        // 5. Mock Location Analytics & Benchmark
        $locationAnalytics = [
            ['city' => 'Kuala Lumpur', 'percentage' => 45],
            ['city' => 'Petaling Jaya', 'percentage' => 25],
            ['city' => 'Subang Jaya', 'percentage' => 15],
            ['city' => 'Shah Alam', 'percentage' => 10],
            ['city' => 'Others', 'percentage' => 5],
        ];
        $areaBenchmark = "You are in the top 15% of vendors in " . ($vendor->state ?: 'your area') . " this week!";

        return response()->json([
            'view_count' => $viewCount,
            'whatsapp_click_count' => $whatsappCount,
            'tiktok_click_count' => $tiktokCount,
            'facebook_click_count' => $facebookCount,
            'total_social_clicks' => $totalSocialClicks,
            'click_through_rate' => $ctr,
            'trends' => [
                'views' => $viewTrend,
                'clicks' => $clicksTrend,
                'ctr' => $ctrTrend,
            ],
            'chart_data' => $chartData,
            'subscription' => [
                'tier' => $vendor->subscription_tier,
                'expires_at' => $vendor->subscription_expires_at,
                'is_featured' => (bool) $vendor->is_featured,
                'is_golpro' => (bool) $vendor->is_golpro,
            ],
            'profile_status' => [
                'is_approved' => (bool) $vendor->is_approved,
                'is_verified' => (bool) $vendor->is_verified,
                'slug' => $vendor->slug,
            ],
            // New Feature Data
            'favorites_count' => $favoritesCount,
            'completeness_score' => $completenessScore,
            'recent_activity' => $recentActivity,
            'limits_usage' => [
                'current_photos' => $photoCount,
                'max_photos' => $maxPhotos
            ],
            'location_analytics' => $locationAnalytics,
            'area_benchmark' => $areaBenchmark,
        ]);
    }

    /** Vendor updates their own public profile (including WhatsApp phone). */
    public function updateProfile(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:200'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'area' => ['sometimes', 'nullable', 'string', 'max:120'],
            'state' => ['sometimes', 'nullable', 'string', 'max:60'],
            'address' => ['sometimes', 'nullable', 'string', 'max:300'],
            'price_from' => ['sometimes', 'integer', 'min:0'],
            'years_experience' => ['sometimes', 'integer', 'min:0', 'max:80'],
            'instagram' => ['sometimes', 'nullable', 'string', 'max:100'],
            'tiktok' => ['sometimes', 'nullable', 'string', 'max:100'],
            'facebook' => ['sometimes', 'nullable', 'string', 'max:100'],
            'whatsapp_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'nullable', 'email', 'max:200'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'response_time_hours' => ['sometimes', 'integer', 'min:1', 'max:168'],
            'specialties' => ['sometimes', 'array'],
            'specialties.*' => ['string', 'max:80'],
            'languages' => ['sometimes', 'array'],
            'languages.*' => ['string', 'max:60'],
            'religion_focus' => ['sometimes', 'array'],
            'religion_focus.*' => ['string', 'max:60'],
            'vendor_category_id' => ['sometimes', 'nullable', 'exists:vendor_categories,id'],
            'business_type' => ['sometimes', 'string', 'in:ssm,startup,homemade'],
            'custom_category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'venue_type' => ['sometimes', 'nullable', 'string', 'max:60'],
            'style' => ['sometimes', 'nullable', 'string', 'max:100'],
            'capacity' => ['sometimes', 'nullable', 'string', 'max:60'],
            'map_url' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'is_all_inclusive' => ['sometimes', 'boolean'],
            'also_for' => ['sometimes', 'array'],
            'also_for.*' => ['string', 'max:60'],
        ]);

        // Strip non-digits from whatsapp phone if provided
        if (isset($data['whatsapp_phone']) && $data['whatsapp_phone']) {
            $data['whatsapp_phone'] = preg_replace('/\D/', '', $data['whatsapp_phone']);
        }

        // If category is set to other/null, default to the "others" category in database
        if (array_key_exists('vendor_category_id', $data) && is_null($data['vendor_category_id'])) {
            $othersCat = \App\Models\VendorCategory::firstOrCreate(
                ['slug' => 'others'],
                ['name' => 'Others']
            );
            $data['vendor_category_id'] = $othersCat->id;
        }

        $customCategory = trim((string) ($data['custom_category'] ?? $vendor->custom_category));
        $selectedCategoryId = $data['vendor_category_id'] ?? $vendor->vendor_category_id;
        $isOtherCategory = \App\Models\VendorCategory::whereKey($selectedCategoryId)
            ->where('slug', 'others')
            ->exists();

        if ($vendor->is_approved && $customCategory !== '' && $isOtherCategory) {
            $customCategory = preg_replace('/\s+/', ' ', mb_substr($customCategory, 0, 100));
            $slug = \Illuminate\Support\Str::slug($customCategory);
            if ($slug === '') {
                $slug = 'category-' . substr(sha1($customCategory), 0, 10);
            }

            $category = \App\Models\VendorCategory::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $customCategory,
                    'position' => ((int) \App\Models\VendorCategory::max('position')) + 1,
                ],
            );
            $data['vendor_category_id'] = $category->id;
        }

        // Tier lock: only elite (golpro) can save social links
        if ($vendor->subscription_tier !== 'elite' && $vendor->subscription_tier !== 'golpro') {
            unset($data['tiktok'], $data['facebook'], $data['instagram'], $data['website'], $data['map_url']);
        }

        $vendor->update($data);
        return response()->json($vendor->fresh());
    }

    /** Upload a photo to the vendor's portfolio gallery (strictly respects tier limits). */
    public function uploadPhoto(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        $tier = $vendor->subscription_tier;
        $maxLimit = 3;
        if ($tier === 'premium') {
            $maxLimit = 10;
        } elseif ($tier === 'elite') {
            $maxLimit = 25;
        }

        $currentPhotos = $vendor->photos ?? [];
        if (count($currentPhotos) >= $maxLimit) {
            return response()->json([
                'message' => "Limit reached! Your current tier (" . ucfirst($tier) . ") only allows up to {$maxLimit} photos. Upgrade to upload more."
            ], 422);
        }

        $request->validate([
            'photo' => ['required', 'image', 'max:5120'], // Max 5MB
        ]);

        $path = $request->file('photo')->store("vendors/{$vendor->id}", 'public');

        $currentPhotos[] = $path;
        $vendor->update(['photos' => $currentPhotos]);

        return response()->json($vendor->fresh());
    }

    /** Delete a photo from the vendor's portfolio gallery. */
    public function deletePhoto(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        $request->validate([
            'path' => ['required', 'string'],
        ]);

        $pathToDelete = $request->input('path');
        $currentPhotos = $vendor->photos ?? [];

        if (($key = array_search($pathToDelete, $currentPhotos)) !== false) {
            unset($currentPhotos[$key]);
            $currentPhotos = array_values($currentPhotos); // reindex

            // Delete file from public disk
            Storage::disk('public')->delete($pathToDelete);

            $vendor->update(['photos' => $currentPhotos]);
        }

        return response()->json($vendor->fresh());
    }

    /** Upload a brochure (PDF/image/document). */
    public function uploadBrochure(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        // Restrict brochure feature to Premium/Elite only! (Free cannot upload brochures)
        if ($vendor->subscription_tier === 'free') {
            return response()->json([
                'message' => 'Brochure upload is only available for Premium and Elite members. Please upgrade to unlock.'
            ], 403);
        }

        $request->validate([
            'brochure' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:10240'], // Max 10MB
        ]);

        // Delete old brochure if exists
        if ($vendor->brochure_path) {
            Storage::disk('public')->delete($vendor->brochure_path);
        }

        $path = $request->file('brochure')->store("vendors/{$vendor->id}/brochure", 'public');
        $vendor->update(['brochure_path' => $path]);

        return response()->json($vendor->fresh());
    }

    /** Delete a brochure. */
    public function deleteBrochure(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        if ($vendor->brochure_path) {
            Storage::disk('public')->delete($vendor->brochure_path);
            $vendor->update(['brochure_path' => null]);
        }

        return response()->json($vendor->fresh());
    }

    /** Upgrades/changes subscription tier instantly. */
    public function selectPlan(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        $request->validate([
            'tier' => ['required', 'in:free,premium,elite'],
        ]);

        $tier = $request->input('tier');

        $dbTier = $tier === 'elite' ? 'golpro' : $tier;

        $vendor->subscription_tier = $dbTier;
        if ($tier === 'elite') {
            $vendor->subscription_expires_at = now()->addDays(30);
            $vendor->is_golpro = true;
            $vendor->is_verified = true;
            $vendor->product_limit = 25;
        } elseif ($tier === 'premium') {
            $vendor->subscription_expires_at = now()->addDays(30);
            $vendor->is_golpro = false;
            $vendor->is_verified = false;
            $vendor->product_limit = 10;
        } else {
            $vendor->subscription_expires_at = null;
            $vendor->is_golpro = false;
            $vendor->is_verified = false;
            $vendor->product_limit = 5;
        }
        $vendor->save();

        return response()->json([
            'message' => "Successfully updated your tier to " . ucfirst($tier) . "!",
            'vendor' => $vendor->fresh()
        ]);
    }

    public function myApplication(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        $application = \App\Models\VendorApplication::where('created_vendor_id', $vendor->id)->with('vendor')->first();
        return response()->json($application);
    }

    public function submitApplicationVerification(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        $application = \App\Models\VendorApplication::where('created_vendor_id', $vendor->id)->first();
        $hasSsmDocument = filled($application?->ssm_doc_path);
        $hasIdentityDocument = filled($application?->nric_or_passport_doc_path);

        $rules = [
            'applicant_name' => ['required', 'string', 'min:2', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'business_name' => ['required', 'string', 'max:255'],
            'business_address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'max:50'],
            'bank_account_holder' => ['required', 'string', 'max:255'],
            'bio' => ['required', 'string', 'max:2000'],
            'business_type' => ['required', 'in:ssm,startup,homemade'],
            'ssm_number' => ['required_if:business_type,ssm', 'nullable', 'string', 'max:50'],
            'ssm_doc' => [\Illuminate\Validation\Rule::requiredIf($request->input('business_type') === 'ssm' && !$hasSsmDocument), 'nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'nric_doc' => [\Illuminate\Validation\Rule::requiredIf(!$hasIdentityDocument), 'nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'social_link' => ['nullable', 'string', 'max:255'],
        ];

        $tier = $vendor->subscription_tier;

        $request->validate($rules);

        $trackedFields = [
            'applicant_name' => 'Contact person',
            'phone' => 'WhatsApp phone',
            'business_name' => 'Business name',
            'business_address' => 'Business address',
            'city' => 'City / area',
            'state' => 'State',
            'bank_name' => 'Bank name',
            'bank_account_number' => 'Bank account number',
            'bank_account_holder' => 'Bank account holder',
            'bio' => 'Business description',
            'business_type' => 'Business setup type',
            'ssm_number' => 'SSM registration number',
            'website' => 'Social / portfolio link',
        ];
        $incoming = [
            'applicant_name' => $request->input('applicant_name'),
            'phone' => $request->input('phone'),
            'business_name' => $request->input('business_name'),
            'business_address' => $request->input('business_address'),
            'city' => $request->input('city'),
            'state' => $request->input('state'),
            'bank_name' => $request->input('bank_name'),
            'bank_account_number' => $request->input('bank_account_number'),
            'bank_account_holder' => $request->input('bank_account_holder'),
            'bio' => $request->input('bio'),
            'business_type' => $request->input('business_type'),
            'ssm_number' => $request->input('ssm_number') ?? 'N/A',
            'website' => $request->input('social_link') ?? $vendor->website,
        ];
        $changes = [];
        if ($application) {
            foreach ($trackedFields as $field => $label) {
                $before = (string) ($application->{$field} ?? '');
                $after = (string) ($incoming[$field] ?? '');
                if ($before !== $after) {
                    $changes[] = ['field' => $field, 'label' => $label, 'from' => $before, 'to' => $after];
                }
            }
        }
        if ($request->hasFile('ssm_doc')) {
            $changes[] = ['field' => 'ssm_doc_path', 'label' => 'SSM certificate', 'from' => $hasSsmDocument ? 'Existing file' : 'Not provided', 'to' => 'Replacement uploaded'];
        }
        if ($request->hasFile('nric_doc')) {
            $changes[] = ['field' => 'nric_or_passport_doc_path', 'label' => 'NRIC / passport copy', 'from' => $hasIdentityDocument ? 'Existing file' : 'Not provided', 'to' => 'Replacement uploaded'];
        }

        $request->user()->update(['name' => $request->input('applicant_name')]);
        $vendor->update([
            'name' => $request->input('business_name'),
            'whatsapp_phone' => preg_replace('/\D/', '', $request->input('phone')),
            'address' => $request->input('business_address'),
            'area' => $request->input('city'),
            'state' => $request->input('state'),
            'bio' => $request->input('bio'),
        ]);

        $ssmPath = $application?->ssm_doc_path;
        if ($request->hasFile('ssm_doc')) {
            $ssmPath = $request->file('ssm_doc')->store("vendors/{$vendor->id}/verification", 'public');
        }
        $nricPath = $application?->nric_or_passport_doc_path;
        if ($request->hasFile('nric_doc')) {
            $nricPath = $request->file('nric_doc')->store("vendors/{$vendor->id}/verification", 'public');
        }
        
        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store("vendors/{$vendor->id}/verification", 'public');
        }

        $sensitiveFields = ['business_type', 'ssm_number', 'ssm_doc_path', 'nric_or_passport_doc_path'];
        $requiresReview = collect($changes)->contains(fn ($change) => in_array($change['field'], $sensitiveFields, true));
        $nextStatus = match (true) {
            !$application => 'pending',
            $application->status === 'rejected' => 'pending',
            $application->status === 'approved' && !$requiresReview => 'approved',
            default => 'pending',
        };

        $application = \App\Models\VendorApplication::updateOrCreate(
            ['created_vendor_id' => $vendor->id],
            [
                'reference' => 'VER-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'applicant_name' => $request->input('applicant_name'),
                'email' => $request->user()->email,
                'phone' => $request->input('phone'),
                'business_name' => $request->input('business_name'),
                'business_address' => $request->input('business_address'),
                'city' => $request->input('city'),
                'state' => $request->input('state'),
                'vendor_category_id' => $vendor->vendor_category_id,
                'business_type' => $request->input('business_type'),
                'ssm_number' => $request->input('ssm_number') ?? 'N/A',
                'ssm_doc_path' => $ssmPath,
                'nric_or_passport_doc_path' => $nricPath,
                'payment_proof_path' => $paymentProofPath,
                'subscription_tier_requested' => $tier === 'elite' ? 'golpro' : $tier,
                'website' => $request->input('social_link') ?? $vendor->website,
                'bank_name' => $request->input('bank_name'),
                'bank_account_number' => $request->input('bank_account_number'),
                'bank_account_holder' => $request->input('bank_account_holder'),
                'bio' => $request->input('bio'),
                'status' => $nextStatus,
                'rejection_reason' => $nextStatus === 'pending' ? null : $application?->rejection_reason,
                'ai_rejection_reason' => $nextStatus === 'pending' ? null : $application?->ai_rejection_reason,
                'reviewed_by_user_id' => $nextStatus === 'pending' ? null : $application?->reviewed_by_user_id,
                'reviewed_at' => $nextStatus === 'pending' ? null : $application?->reviewed_at,
                'amendment_changes' => $changes ?: null,
                'amendment_submitted_at' => $application && $changes ? now() : null,
                'created_user_id' => $request->user()->id,
            ]
        );

        return response()->json([
            'message' => $nextStatus === 'pending'
                ? 'Your changes were submitted for administrator review.'
                : 'Your application details were updated.',
            'requires_review' => $nextStatus === 'pending',
            'application' => $application->fresh('vendor'),
        ]);
    }

    public function claimBadge(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked to this account.');

        $application = \App\Models\VendorApplication::where('created_vendor_id', $vendor->id)->first();
        abort_if(!$application || $application->status !== 'approved', 400, 'You do not have an approved verification application.');

        $vendor->update([
            'is_badge_claimed' => true,
            'is_approved' => false, // Unlocked but unpublished by default
            'is_verified' => true,
        ]);

        return response()->json([
            'message' => 'Badge claimed successfully! You can now publish your profile.',
            'vendor' => $vendor->fresh(),
        ]);
    }

    public function togglePublish(Request $request)
    {
        $vendor = $request->user()->vendor;
        abort_if(!$vendor, 403, 'No vendor profile linked.');

        abort_if(!$vendor->is_badge_claimed, 403, 'You must claim your verified setup badge before publishing your profile.');

        $vendor->update([
            'is_approved' => !$vendor->is_approved
        ]);

        return response()->json([
            'message' => $vendor->is_approved ? 'Profile published live!' : 'Profile unpublished (hidden).',
            'vendor' => $vendor->fresh()
        ]);
    }
}
