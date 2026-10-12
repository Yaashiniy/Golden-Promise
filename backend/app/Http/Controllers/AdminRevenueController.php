<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorApplication;

class AdminRevenueController extends Controller
{
    /**
     * Advertising revenue dashboard.
     * Revenue comes from vendor subscription tiers (Free / Premium / GolPro).
     */
    public function revenue()
    {
        // Subscription tier pricing (RM/month)
        $pricing = [
            'free' => 0,
            'premium' => 299,
            'golpro' => 399,
        ];

        $vendors = Vendor::query()->where('is_approved', true)->get();

        $byTier = [];
        foreach (['free', 'premium', 'golpro'] as $tier) {
            $count = $vendors->where('subscription_tier', $tier)->count();
            $byTier[] = [
                'tier' => $tier,
                'vendors' => $count,
                'price' => $pricing[$tier],
                'revenue' => $count * $pricing[$tier],
            ];
        }

        $mrr = array_sum(array_map(fn ($t) => $t['revenue'], $byTier));

        // Growth: vendors approved this month vs last month
        $thisMonth = $vendors->filter(fn ($v) => $v->created_at?->isCurrentMonth())->count();
        $lastMonth = $vendors->filter(fn ($v) => $v->created_at?->isLastMonth())->count();

        return response()->json([
            'monthly_recurring_revenue' => $mrr,
            'annualised' => $mrr * 12,
            'total_vendors' => $vendors->count(),
            'paying_vendors' => $vendors->whereIn('subscription_tier', ['premium', 'golpro'])->count(),
            'by_tier' => $byTier,
            'growth' => [
                'this_month' => $thisMonth,
                'last_month' => $lastMonth,
            ],
            'pending_applications' => VendorApplication::where('status', 'pending')->count(),
        ]);
    }
}
