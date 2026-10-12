<?php

namespace App\Services;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Collection;

class BudgetIntelligenceService
{
    public function analyse(User $user, Collection $categories, int $totalBudget): array
    {
        $allocated = (int) $categories->sum('estimated');
        $remaining = $totalBudget - $allocated;
        $actualTotal = (int) $categories->sum(fn ($category) => $category->items->sum('actual_cost'));
        $paidTotal = (int) $categories->sum(fn ($category) => $category->items->sum('paid_amount'));
        $guests = (int) ($user->guest_count ?? 0);
        $cultureRequirements = $this->cultureRequirements((string) $user->culture);
        $categoryNames = $categories->pluck('name')->map(fn ($name) => mb_strtolower($name));
        $missing = collect($cultureRequirements)->filter(function ($requirement) use ($categoryNames) {
            return !$categoryNames->contains(fn ($name) => str_contains($name, mb_strtolower($requirement['category'])));
        })->values();

        $warnings = [];
        if ($totalBudget > 0 && $allocated > $totalBudget) {
            $warnings[] = ['type' => 'over_budget', 'message' => 'Your plan is RM ' . number_format(abs($remaining)) . ' over budget.'];
        }
        if ($totalBudget > 0 && $actualTotal > $totalBudget) {
            $warnings[] = [
                'type' => 'actual_over_budget',
                'message' => 'Your actual costs exceed the total budget by RM ' . number_format($actualTotal - $totalBudget) . '.',
            ];
        }
        foreach ($categories as $category) {
            $categoryActual = (int) $category->items->sum('actual_cost');
            if ($categoryActual > (int) $category->estimated) {
                $warnings[] = [
                    'type' => 'category_overrun',
                    'category_id' => $category->id,
                    'category' => $category->name,
                    'estimated' => (int) $category->estimated,
                    'actual' => $categoryActual,
                    'over_by' => $categoryActual - (int) $category->estimated,
                    'message' => $category->name . ' is RM ' . number_format($categoryActual - (int) $category->estimated) . ' above its estimate.',
                ];
            }
        }
        if ($totalBudget > 0 && $remaining >= 0 && $remaining < ($totalBudget * 0.05)) {
            $warnings[] = ['type' => 'low_reserve', 'message' => 'Less than 5% remains for unexpected costs.'];
        }

        $catering = $categories->first(fn ($category) => str_contains(mb_strtolower($category->name), 'cater'));
        if ($catering && $guests > 0) {
            $perGuest = (int) floor($catering->estimated / $guests);
            if ($perGuest < 35) {
                $warnings[] = [
                    'type' => 'low_catering',
                    'message' => "Catering allows about RM {$perGuest} per guest, which may be too low for {$guests} guests.",
                ];
            }
        }

        foreach ($missing as $requirement) {
            $warnings[] = ['type' => 'missing_culture_item', 'message' => $requirement['reason']];
        }

        $allocationScore = $totalBudget > 0 ? max(0, 30 - (abs($remaining) / $totalBudget * 30)) : 0;
        $essentialScore = count($cultureRequirements) > 0
            ? 25 * ((count($cultureRequirements) - $missing->count()) / count($cultureRequirements))
            : 25;
        $selectedItems = $categories->sum(fn ($category) => $category->items->count());
        $vendorScore = min(20, $selectedItems * 4);
        $reserveScore = $totalBudget > 0 && $remaining >= $totalBudget * 0.05 ? 15 : 5;
        $profileScore = ($guests > 0 ? 5 : 0) + ($user->wedding_location ? 5 : 0);

        return [
            'total_budget' => $totalBudget,
            'allocated' => $allocated,
            'remaining' => $remaining,
            'actual_total' => $actualTotal,
            'paid_total' => $paidTotal,
            'actual_budget_remaining' => $totalBudget - $actualTotal,
            'guest_count' => $guests,
            'catering_per_guest' => $catering && $guests > 0 ? (int) floor($catering->estimated / $guests) : null,
            'preferences' => $user->budget_preferences ?? [],
            'culture_requirements' => $cultureRequirements,
            'warnings' => $warnings,
            'health' => [
                'score' => (int) round(min(100, $allocationScore + $essentialScore + $vendorScore + $reserveScore + $profileScore)),
                'explanation' => $this->healthExplanation($remaining, $missing->count(), $warnings),
                'breakdown' => [
                    'allocation' => (int) round($allocationScore),
                    'essentials' => (int) round($essentialScore),
                    'vendors' => (int) round($vendorScore),
                    'reserve' => (int) round($reserveScore),
                    'profile' => (int) round($profileScore),
                ],
            ],
        ];
    }

    public function scoreVendor(Vendor $vendor, array $filters): int
    {
        $score = 0;
        $state = mb_strtolower((string) ($filters['state'] ?? ''));
        if ($state && str_contains(mb_strtolower((string) $vendor->state), $state)) $score += 30;

        $max = (int) ($filters['budget_max'] ?? 0);
        if (!$max || !$vendor->price_from || $vendor->price_from <= $max) $score += 25;

        $wantedCultures = $this->cultureFamilies((string) ($filters['culture'] ?? ''));
        $cultureText = mb_strtolower(implode(' ', array_filter([
            $vendor->name, $vendor->venue_type, $vendor->bio,
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
        if (collect($wantedCultures)->contains(fn ($family) => collect($aliases[$family] ?? [$family])
            ->contains(fn ($alias) => str_contains($cultureText, $alias)))) $score += 20;

        if ($vendor->is_verified) $score += 15;
        $score += min(10, (int) round(((float) ($vendor->rating ?? 0)) * 2));
        return $score;
    }

    public function cultureFamilies(string $culture): array
    {
        $culture = mb_strtolower($culture);
        $families = [];
        $map = [
            'indian' => ['tamil', 'telugu', 'malayalam', 'hindu', 'indian'],
            'chinese' => ['chinese', 'cantonese', 'hokkien', 'hakka', 'teochew'],
            'malay' => ['malay', 'muslim', 'nikah', 'melayu'],
            'christian' => ['christian', 'catholic', 'church', 'protestant'],
            'sikh' => ['sikh', 'punjabi', 'gurdwara'],
            'civil' => ['civil', 'western', 'registry'],
        ];
        foreach ($map as $family => $keywords) {
            if (collect($keywords)->contains(fn ($keyword) => str_contains($culture, $keyword))) $families[] = $family;
        }
        return array_values(array_unique($families));
    }

    private function cultureRequirements(string $culture): array
    {
        $culture = mb_strtolower($culture);
        $requirements = [];
        if (str_contains($culture, 'tamil')) {
            $requirements[] = ['category' => 'Ceremony', 'reason' => 'Add a ceremony allocation for the Tamil priest, thali, garlands, homam materials, and Oonjal or Nalangu customs.'];
        }
        if (str_contains($culture, 'telugu')) {
            $requirements[] = ['category' => 'Telugu rituals', 'reason' => 'Add an allocation for Telugu rituals such as Pellikuthuru, Jeelakarra Bellam, and Talambralu.'];
        }
        if (str_contains($culture, 'chinese')) {
            $requirements[] = ['category' => 'Tea ceremony', 'reason' => 'Add a tea ceremony allocation for attire, tea set, gifts, and family arrangements.'];
        }
        if (str_contains($culture, 'malay') || str_contains($culture, 'muslim')) {
            $requirements[] = ['category' => 'Nikah', 'reason' => 'Add an Akad Nikah allocation for documents, officiant, attire, and ceremony items.'];
        }
        return $requirements;
    }

    private function healthExplanation(int $remaining, int $missingCount, array $warnings): string
    {
        if ($remaining < 0) return 'The current allocations exceed the total budget.';
        if ($missingCount > 0) return "The plan still misses {$missingCount} culture-specific allocation(s).";
        if (count($warnings) > 0) return 'The plan is workable but still has items that need attention.';
        return 'The budget is balanced and its essential allocations are covered.';
    }
}
