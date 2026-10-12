<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetExpense;
use App\Models\Vendor;
use App\Models\VendorCategory;
use App\Services\BudgetIntelligenceService;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(private readonly BudgetIntelligenceService $intelligence)
    {
    }

    public function show(Request $request)
    {
        $user = $request->user();
        $budget = Budget::firstOrCreate(['user_id' => $user->id], ['total_budget' => 0]);
        $expenses = BudgetExpense::where('user_id', $user->id)->orderByDesc('date')->get();
        $categories = $user->budgetCategories()
            ->with(['items' => fn ($q) => $q->with('vendor')->orderBy('position')])
            ->orderBy('position')
            ->get();
        $spent = $expenses->sum('amount');
        $estimated = $categories->sum('estimated');
        $intelligence = $this->intelligence->analyse($user, $categories, (int) $budget->total_budget);
        return response()->json([
            'total_budget' => $budget->total_budget,
            'estimated' => $estimated,
            'spent' => $spent,
            'balance' => $budget->total_budget - $spent,
            'expenses' => $expenses,
            'categories' => $categories,
            'intelligence' => $intelligence,
        ]);
    }

    public function setTotal(Request $request)
    {
        $data = $request->validate(['total_budget' => ['required', 'integer', 'min:0']]);
        $budget = Budget::updateOrCreate(['user_id' => $request->user()->id], $data);
        return response()->json($budget);
    }

    public function topMatches(Request $request)
    {
        $data = $request->validate(['category_id' => ['required', 'integer']]);
        $user = $request->user();
        $category = $user->budgetCategories()->findOrFail($data['category_id']);
        $isVenue = str_contains(mb_strtolower($category->name), 'venue');
        $locationParts = array_values(array_filter(array_map('trim', explode(',', (string) $user->wedding_location))));
        $area = $locationParts[0] ?? null;
        $state = count($locationParts) > 1 ? end($locationParts) : $area;

        $query = Vendor::query()->where('is_approved', true)->with('category:id,slug,name');
        if ($isVenue) {
            $query->whereHas('category', fn ($builder) => $builder->where('slug', 'venues'));
        } else {
            $norm = mb_strtolower(trim($category->name));
            $slug = null;
            if (str_contains($norm, 'photo') || str_contains($norm, 'video') || str_contains($norm, 'camera')) $slug = 'videographer-photographer';
            elseif (str_contains($norm, 'cater') || str_contains($norm, 'food')) $slug = 'caterer';
            elseif (str_contains($norm, 'cake') || str_contains($norm, 'dessert') || str_contains($norm, 'bakery')) $slug = 'cake-desserts';
            elseif (str_contains($norm, 'band') || str_contains($norm, 'dj') || str_contains($norm, 'music') || str_contains($norm, 'entertainment')) $slug = 'band-dj';
            elseif (str_contains($norm, 'florist') || str_contains($norm, 'flower') || str_contains($norm, 'decor')) $slug = 'florist';
            elseif (str_contains($norm, 'henna') || str_contains($norm, 'mehndi')) $slug = 'henna-artist';
            elseif (str_contains($norm, 'makeup') || str_contains($norm, 'mua') || str_contains($norm, 'beauty')) $slug = 'makeup-artist';
            elseif (str_contains($norm, 'dance')) $slug = 'dancers';

            if ($slug) {
                $query->whereHas('category', fn($q) => $q->where('slug', $slug));
            } else {
                $needle = rtrim($norm, 's');
                $vendorCategory = VendorCategory::query()
                    ->whereRaw('LOWER(name) LIKE ?', ["%{$needle}%"])
                    ->orWhereRaw('LOWER(slug) LIKE ?', ["%{$needle}%"])
                    ->first();
                if ($vendorCategory) {
                    $query->where('vendor_category_id', $vendorCategory->id);
                } else {
                    $query->where('id', 0); // Return empty if category is unrecognized, rather than random vendors
                }
            }
        }

        if ($state || $area) {
            $query->where(function ($builder) use ($state, $area) {
                if ($state) $builder->where('state', 'ILIKE', "%{$state}%");
                if ($area) $builder->orWhere('area', 'ILIKE', "%{$area}%");
            });
        }
        if ($category->estimated > 0) {
            $query->where(function ($builder) use ($category) {
                $builder->whereNull('price_from')->orWhere('price_from', '<=', $category->estimated);
            });
        }

        $families = $this->intelligence->cultureFamilies((string) $user->culture);
        $guestCount = (int) ($user->guest_count ?? 0);
        $matches = $query->limit(100)->get()
            ->filter(function (Vendor $vendor) use ($families) {
                if (empty($families)) return true;
                $searchable = mb_strtolower(implode(' ', array_filter([
                    $vendor->name, $vendor->venue_type, $vendor->bio, $vendor->description,
                    implode(' ', $vendor->religion_focus ?? []),
                ])));
                $aliases = [
                    'indian' => ['indian', 'hindu', 'tamil', 'telugu', 'temple'],
                    'chinese' => ['chinese', 'cantonese', 'hokkien', 'hakka', 'teochew'],
                    'malay' => ['malay', 'muslim', 'masjid', 'nikah'],
                    'christian' => ['christian', 'catholic', 'church'],
                    'sikh' => ['sikh', 'punjabi', 'gurdwara'],
                    'civil' => ['civil', 'western', 'registry'],
                ];
                return collect($families)->contains(fn ($family) => collect($aliases[$family] ?? [$family])
                    ->contains(fn ($alias) => str_contains($searchable, $alias)));
            })
            ->filter(function (Vendor $vendor) use ($guestCount) {
                if ($guestCount <= 0 || !$vendor->capacity) return true;
                preg_match_all('/\d+/', (string) $vendor->capacity, $numbers);
                $capacity = empty($numbers[0]) ? 0 : max(array_map('intval', $numbers[0]));
                return $capacity === 0 || $capacity >= $guestCount;
            })
            ->map(function (Vendor $vendor) use ($user, $state, $category, $guestCount) {
                $score = $this->intelligence->scoreVendor($vendor, [
                    'state' => $state,
                    'culture' => $user->culture,
                    'budget_max' => $category->estimated,
                ]);
                $reasons = [];
                if ($state) $reasons[] = "Located in {$state}";
                if ($category->estimated > 0 && (!$vendor->price_from || $vendor->price_from <= $category->estimated)) $reasons[] = 'Within category budget';
                if ($guestCount > 0 && $vendor->capacity) $reasons[] = "Suitable for {$guestCount} guests";
                if ($vendor->is_verified) $reasons[] = 'Verified vendor';
                $vendor->match_score = min(100, $score + ($guestCount > 0 && $vendor->capacity ? 10 : 0));
                $vendor->match_reasons = $reasons;
                return $vendor;
            })
            ->sortByDesc('match_score')
            ->take(6)
            ->values();

        return response()->json([
            'matches' => $matches,
            'profile' => [
                'culture' => $user->culture,
                'guest_count' => $guestCount,
                'location' => $user->wedding_location,
                'budget' => (int) $category->estimated,
            ],
        ]);
    }

    public function storeExpense(Request $request)
    {
        $data = $request->validate([
            'vendor_category' => ['required', 'string', 'max:80'],
            'vendor_name' => ['required', 'string', 'max:120'],
            'date' => ['nullable', 'date'],
            'amount' => ['required', 'integer', 'min:0'],
        ]);
        $expense = $request->user()->budgetExpenses()->create($data);
        return response()->json($expense, 201);
    }

    public function updateExpense(Request $request, BudgetExpense $expense)
    {
        $this->authorizeOwner($request, $expense);
        $data = $request->validate([
            'vendor_category' => ['required', 'string', 'max:80'],
            'vendor_name' => ['required', 'string', 'max:120'],
            'date' => ['nullable', 'date'],
            'amount' => ['required', 'integer', 'min:0'],
        ]);
        $expense->update($data);
        return response()->json($expense);
    }

    public function destroyExpense(Request $request, BudgetExpense $expense)
    {
        $this->authorizeOwner($request, $expense);
        $expense->delete();
        return response()->json(['ok' => true]);
    }

    private function authorizeOwner(Request $request, BudgetExpense $expense): void
    {
        abort_if($expense->user_id !== $request->user()->id, 403);
    }
}
