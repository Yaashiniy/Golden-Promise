<?php

namespace App\Services;

use App\Models\User;
use App\Models\ChecklistItem;
use App\Models\BudgetCategory;
use App\Services\AI\GroqService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PlannerGeneratorService
{
    public function __construct(private readonly GroqService $ai)
    {
    }

    /**
     * Generate checklist items based on culture and wedding date.
     */
    public function generateChecklist(User $user): int
    {
        $culture = $user->culture;
        if (!$culture) {
            return 0;
        }

        $knowledge = $this->loadKnowledge($culture);

        $system = <<<SYS
You are an expert Malaysian wedding planner. The user wants a comprehensive A-to-Z checklist
for their wedding. They have specified a cultural background — be culturally accurate and
include traditional rituals, items, attire, ceremonies, and vendor bookings appropriate to
that culture. Cover EVERYTHING from 12+ months ahead down to the wedding day.

The selected culture is: {$culture}

If the selected culture names more than one tradition (for example "Tamil + Telugu"), treat it
as a fusion wedding. Include clearly identifiable preparation and ceremony items from EVERY
named tradition in balanced coverage. Add shared coordination tasks where the families need to
agree which customs are combined, kept separate, or led by each priest. Never silently reduce a
compound culture to only its first tradition.

{$knowledge}

Return STRICT JSON only:
{
  "sections": [
    {
      "title": "string (e.g. 'Akad Nikah Preparation', 'Tea Ceremony', 'Reception Decor')",
      "months_before": number (integer representing how many months before the wedding this section should be completed, e.g. 12, 9, 6, 3, 1, 0),
      "items": ["string", "string", ...]
    }
  ]
}

Available values for months_before: 12, 9, 6, 3, 1, 0. Sort sections by months_before DESC (earliest preparation first).
Each section should have 5–10 specific, actionable items. Use exact Malaysian terminology where relevant.
Items must be short imperatives like "Book makeup artist for both ceremonies" or "Order hantaran trays (7 or 9)".
SYS;

        $user_context = json_encode([
            'culture' => $culture,
            'wedding_date' => $user->wedding_date?->toDateString(),
            'wedding_location' => $user->wedding_location,
        ]);

        $result = $this->ai->jsonCompletion($system, $user_context);
        $sections = $result['sections'] ?? [];
        $createdCount = 0;

        DB::transaction(function () use ($user, $sections, &$createdCount) {
            // Remove previously AI-generated items
            $user->checklistItems()->where('is_ai_generated', true)->delete();

            $weddingDate = $user->wedding_date ? Carbon::parse($user->wedding_date) : null;
            $totalMonths = $weddingDate ? Carbon::now()->diffInMonths($weddingDate, false) : 12;

            $position = $user->checklistItems()->max('position') ?? 0;
            foreach ($sections as $section) {
                $sectionTitle = $section['title'] ?? 'General';
                $monthsBefore = (int) ($section['months_before'] ?? 12);

                // Compress deadlines if engagement is shorter than the task category window
                $effectiveMonthsBefore = ($totalMonths < $monthsBefore) ? max(0, $totalMonths) : $monthsBefore;
                $dueDate = $weddingDate ? $weddingDate->copy()->subMonths($effectiveMonthsBefore)->toDateString() : null;

                foreach (($section['items'] ?? []) as $item) {
                    $position++;
                    ChecklistItem::create([
                        'user_id' => $user->id,
                        'title' => $item,
                        'section' => $sectionTitle,
                        'due_date' => $dueDate,
                        'position' => $position,
                        'is_ai_generated' => true,
                    ]);
                    $createdCount++;
                }
            }
        });

        return $createdCount;
    }

    /**
     * Generate budget categories based on culture and guest count.
     */
    public function generateBudget(User $user, int $totalBudget): int
    {
        $culture = $user->culture;
        if (!$culture || $totalBudget < 1000) {
            return 0;
        }

        $guests = $user->guest_count ?? 200;

        $knowledge = $this->loadKnowledge($culture);

        $system = <<<SYS
You are a Malaysian wedding budget planner. Allocate the couple's total budget into realistic
categories based on their culture and guest count. All amounts are in Malaysian Ringgit (RM).

{$knowledge}

Return STRICT JSON only:
{
  "categories": [
    {
      "name": "string (e.g. Venue, Catering, Photography, Florist, Attire, Jewellery, Mehndi, Entertainment, ...)",
      "icon": "string (lucide-react icon name like 'utensils' / 'camera' / 'flower' / 'shirt' / 'music' / 'gem' / 'building' / 'sparkles' / 'cake')",
      "color": "#rrggbb (soft pastel/muted hex)",
      "estimated": number (RM, this couple's allocation),
      "avg_min": number (typical Malaysian wedding low end RM),
      "avg_max": number (typical Malaysian wedding high end RM),
      "note": "string (1 sentence why this allocation)"
    }
  ],
  "rationale": "1-2 sentence overall summary"
}

Sum of "estimated" should equal total_budget (allow small rounding). Provide 6–10 categories.
Sort categories by estimated DESC. Keep hex colors muted, e.g. #c4a484, #a8b89a, #b78ba3, #6b7a8f, #d2b48c.
SYS;

        $user_context = json_encode([
            'culture' => $culture,
            'total_budget' => $totalBudget,
            'guests' => $guests,
            'wedding_location' => $user->wedding_location,
        ]);

        $result = $this->ai->jsonCompletion($system, $user_context);
        $categories = $result['categories'] ?? [];
        $createdCount = 0;

        DB::transaction(function () use ($user, $totalBudget, $categories, &$createdCount) {
            $user->budget()->updateOrCreate(['user_id' => $user->id], ['total_budget' => $totalBudget]);

            // Clear previous AI-generated categories
            BudgetCategory::where('user_id', $user->id)->where('is_ai_generated', true)->delete();

            $position = 0;
            foreach ($categories as $c) {
                $position++;
                BudgetCategory::create([
                    'user_id' => $user->id,
                    'name' => $c['name'] ?? 'Category',
                    'icon' => $c['icon'] ?? 'sparkles',
                    'color' => $c['color'] ?? '#c4a484',
                    'estimated' => (int) ($c['estimated'] ?? 0),
                    'avg_min' => (int) ($c['avg_min'] ?? 0),
                    'avg_max' => (int) ($c['avg_max'] ?? 0),
                    'position' => $position,
                    'is_ai_generated' => true,
                ]);
                $createdCount++;
            }
        });

        return $createdCount;
    }

    /**
     * Load culture-specific knowledge from the Obsidian vault in resources/knowledge/.
     * Fuzzy-matches free-form culture strings (e.g. "Chindian", "Muslim + Christian").
     * Always loads _shared.md. Graceful fallback if no file found.
     */
    private function loadKnowledge(string $culture): string
    {
        // Keyword → vault filename. Value can be string or array for compound cultures.
        $keywords = [
            'chindian'   => ['chinese', 'indian'],
            'malay'      => 'malay',
            'muslim'     => 'malay',
            'melayu'     => 'malay',
            'nikah'      => 'malay',
            'chinese'    => 'chinese',
            'cantonese'  => 'chinese',
            'hokkien'    => 'chinese',
            'hakka'      => 'chinese',
            'teochew'    => 'chinese',
            'mandarin'   => 'chinese',
            'indian'     => 'indian',
            'hindu'      => 'indian',
            'tamil'      => ['indian', 'tamil'],
            'telugu'     => ['indian', 'telugu'],
            'malayalam'  => 'indian',
            'punjabi'    => 'indian',
            'sikh'       => 'indian',
            'christian'  => 'christian',
            'catholic'   => 'christian',
            'church'     => 'christian',
            'protestant' => 'christian',
            'anglican'   => 'christian',
            'methodist'  => 'christian',
            'baptist'    => 'christian',
            'civil'      => 'civil',
            'registry'   => 'civil',
            'western'    => 'civil',
        ];

        $lower = strtolower($culture);
        $base  = resource_path('knowledge');
        $slugs = [];

        foreach ($keywords as $keyword => $slug) {
            if (str_contains($lower, $keyword)) {
                foreach ((array) $slug as $s) {
                    $slugs[$s] = true;
                }
            }
        }

        $parts = [];

        foreach (array_keys($slugs) as $slug) {
            $path = "{$base}/{$slug}.md";
            if (file_exists($path)) {
                $parts[] = file_get_contents($path);
            }
        }

        $sharedPath = "{$base}/_shared.md";
        if (file_exists($sharedPath)) {
            $parts[] = file_get_contents($sharedPath);
        }

        if (empty($parts)) {
            return '';
        }

        return "--- CULTURAL KNOWLEDGE VAULT ---\n\n"
            . implode("\n\n---\n\n", $parts)
            . "\n\n--- END OF VAULT ---";
    }
}
