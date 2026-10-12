<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;

class VenueController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::query()
            ->where('is_approved', true)
            ->whereHas('category', fn($q) => $q->where('slug', 'venues'));

        if ($state = $request->string('state')->toString()) {
            $query->where('state', $state);
        }
        if ($area = $request->string('area')->toString()) {
            $query->where('area', $area);
        }
        if ($religion = $request->string('religion')->toString()) {
            $query->whereJsonContains('religion_focus', $religion);
        }
        if ($q = $request->string('q')->toString()) {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%$q%")
                  ->orWhere('area', 'like', "%$q%")
                  ->orWhere('state', 'like', "%$q%");
            });
        }
        if ($min = $request->integer('min_price')) {
            $query->where('price_from', '>=', $min);
        }
        if ($max = $request->integer('max_price')) {
            $query->where('price_from', '<=', $max);
        }

        return $query->orderByDesc('rating')->paginate(24);
    }

    public function show(Vendor $venue)
    {
        $user = auth('sanctum')->user();
        $isAdmin = $user && $user->role === 'admin';
        // Allow owner to view their own venue via Vendor association implicitly (or they just use the vendor link)
        abort_if(!$venue->is_approved && !$isAdmin, 404, 'This venue is not yet published.');

        $venue->increment('view_count');

        $similar = Vendor::query()
            ->where('is_approved', true)
            ->whereHas('category', fn($q) => $q->where('slug', 'venues'))
            ->where('id', '!=', $venue->id)
            ->where('state', $venue->state)
            ->orderByDesc('rating')
            ->limit(4)
            ->get(['id', 'slug', 'name', 'area', 'state', 'price_from', 'rating', 'photos']);

        if ($similar->count() < 2) {
            $extra = Vendor::query()
                ->where('is_approved', true)
                ->whereHas('category', fn($q) => $q->where('slug', 'venues'))
                ->where('id', '!=', $venue->id)
                ->whereNotIn('id', $similar->pluck('id'))
                ->orderByDesc('rating')
                ->limit(4 - $similar->count())
                ->get(['id', 'slug', 'name', 'area', 'state', 'price_from', 'rating', 'photos']);
            $similar = $similar->concat($extra);
        }

        return response()->json([
            'venue' => $venue,
            'stats' => [
                'view_count' => $venue->view_count,
                'member_since_year' => $venue->created_at?->year,
                'member_since_label' => $venue->created_at?->format('M Y'),
            ],
            'similar' => $similar,
        ]);
    }

    public function trackWhatsapp(Vendor $venue)
    {
        $venue->increment('whatsapp_click_count');
        return response()->json(['ok' => true, 'link' => $venue->whatsapp_link]);
    }

    public function areas()
    {
        return Vendor::query()->where('is_approved', true)->whereHas('category', fn($q) => $q->where('slug', 'venues'))->distinct()->orderBy('area')->pluck('area');
    }

    public function states()
    {
        return Vendor::query()->where('is_approved', true)->whereHas('category', fn($q) => $q->where('slug', 'venues'))->distinct()->whereNotNull('state')->orderBy('state')->pluck('state');
    }

    public function filters()
    {
        $base = Vendor::query()->where('is_approved', true)->whereHas('category', fn($q) => $q->where('slug', 'venues'));
        return response()->json([
            'states' => (clone $base)->distinct()->whereNotNull('state')->orderBy('state')->pluck('state'),
            'religions' => ['Malay', 'Chinese', 'Indian', 'Christian', 'Sikh', 'Civil'],
            'price_min' => (int) (clone $base)->min('price_from'),
            'price_max' => (int) (clone $base)->max('price_from'),
        ]);
    }
}
