<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::query()->where('is_approved', true)->with('category:id,slug,name');

        if ($categorySlug = $request->string('category')->toString()) {
            $category = VendorCategory::where('slug', $categorySlug)->first();
            if ($category) {
                $query->where('vendor_category_id', $category->id);
            }
        } else {
            $query->whereHas('category', function ($q) {
                $q->where('slug', '!=', 'venues');
            });
        }

        if ($state = $request->string('state')->toString()) {
            $query->where('state', $state);
        }

        if ($religion = $request->string('religion')->toString()) {
            $query->whereJsonContains('religion_focus', $religion);
        }

        if ($q = trim($request->string('q')->toString())) {
            $terms = preg_split('/\s+/', mb_substr($q, 0, 100), -1, PREG_SPLIT_NO_EMPTY);

            foreach ($terms as $term) {
                $like = '%' . $term . '%';

                $query->where(function ($match) use ($like) {
                    $match->whereRaw('name ILIKE ?', [$like])
                        ->orWhereRaw('area ILIKE ?', [$like])
                        ->orWhereRaw('state ILIKE ?', [$like])
                        ->orWhereRaw('address ILIKE ?', [$like])
                        ->orWhereRaw('bio ILIKE ?', [$like])
                        ->orWhereRaw('experiences ILIKE ?', [$like])
                        ->orWhereRaw('custom_category ILIKE ?', [$like])
                        ->orWhereRaw('description ILIKE ?', [$like])
                        ->orWhereRaw('venue_type ILIKE ?', [$like])
                        ->orWhereRaw('style ILIKE ?', [$like])
                        ->orWhereRaw('capacity ILIKE ?', [$like])
                        ->orWhereRaw('CAST(languages AS TEXT) ILIKE ?', [$like])
                        ->orWhereRaw('CAST(specialties AS TEXT) ILIKE ?', [$like])
                        ->orWhereRaw('CAST(religion_focus AS TEXT) ILIKE ?', [$like])
                        ->orWhereHas('category', fn ($category) => $category->whereRaw('name ILIKE ?', [$like]));
                });
            }
        }

        if ($min = $request->integer('min_price')) {
            $query->where('price_from', '>=', $min);
        }
        if ($max = $request->integer('max_price')) {
            $query->where('price_from', '<=', $max);
        }

        // GolPro tier, then rating
        return $query
            ->orderByDesc('is_golpro')
            ->orderByDesc('rating')
            ->paginate(16);
    }

    public function show(Vendor $vendor)
    {
        $user = auth('sanctum')->user();
        $isOwner = $user && $user->id === $vendor->user_id;
        $isAdmin = $user && $user->role === 'admin';
        abort_if(!$vendor->is_approved && !$isOwner && !$isAdmin, 404, 'This vendor profile is not yet published.');

        // Track profile view (fire-and-forget)
        $vendor->increment('view_count');

        $vendor->load([
            'category:id,slug,name',
        ]);

        $similar = Vendor::query()
            ->where('is_approved', true)
            ->where('vendor_category_id', $vendor->vendor_category_id)
            ->where('id', '!=', $vendor->id)
            ->orderByDesc('is_golpro')
            ->orderByDesc('rating')
            ->limit(4)
            ->get(['id', 'slug', 'name', 'area', 'state', 'price_from', 'rating', 'photos', 'is_golpro']);

        return response()->json([
            'vendor' => $vendor,
            'stats' => [
                'view_count' => $vendor->view_count,
                'member_since_year' => $vendor->created_at?->year,
                'member_since_label' => $vendor->created_at?->format('M Y'),
            ],
            'similar' => $similar,
        ]);
    }

    public function trackSocialClick(Vendor $vendor, Request $request)
    {
        $platform = $request->input('platform', 'whatsapp'); // 'whatsapp', 'facebook', 'tiktok', 'instagram', 'website'
        
        \App\Models\VendorAnalyticsLog::create([
            'vendor_id' => $vendor->id,
            'event_type' => 'click_' . $platform,
            // 'visitor_area' => $request->user()?->state, // Optional: if couple is logged in
        ]);

        // Keep legacy counter working
        if ($platform === 'whatsapp') {
            $vendor->increment('whatsapp_click_count');
        }

        return response()->json(['ok' => true]);
    }

    public function trackView(Vendor $vendor, Request $request)
    {
        \App\Models\VendorAnalyticsLog::create([
            'vendor_id' => $vendor->id,
            'event_type' => 'view',
            // 'visitor_area' => $request->user()?->state,
        ]);
        
        // Keep legacy counter working
        $vendor->increment('view_count');

        return response()->json(['ok' => true]);
    }

    public function filters()
    {
        return response()->json([
            'states' => Vendor::query()->where('is_approved', true)->distinct()->whereNotNull('state')->orderBy('state')->pluck('state'),
            'religions' => ['Malay', 'Chinese', 'Indian', 'Christian', 'Sikh', 'Civil'],
            'price_min' => (int) Vendor::query()->where('is_approved', true)->min('price_from'),
            'price_max' => (int) Vendor::query()->where('is_approved', true)->max('price_from'),
        ]);
    }
}
