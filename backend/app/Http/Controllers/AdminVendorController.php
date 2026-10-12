<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminVendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::with('category')->withCount('reviews');

        // Apply filters
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        if ($request->filled('tier')) {
            $query->where('subscription_tier', $request->tier);
        }
        if ($request->filled('area')) {
            $query->where('area', 'like', '%' . $request->area . '%');
        }

        // Get analytics aggregations
        $totalVendors = Vendor::count();
        $byTier = Vendor::select('subscription_tier', DB::raw('count(*) as count'))
            ->groupBy('subscription_tier')
            ->pluck('count', 'subscription_tier');
        $byBusinessType = Vendor::select('business_type', DB::raw('count(*) as count'))
            ->groupBy('business_type')
            ->pluck('count', 'business_type');

        // Paginate results
        $vendors = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'stats' => [
                'total' => $totalVendors,
                'by_tier' => $byTier,
                'by_business_type' => $byBusinessType,
            ],
            'vendors' => $vendors
        ]);
    }
}
