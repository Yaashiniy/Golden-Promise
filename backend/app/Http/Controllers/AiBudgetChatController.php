<?php

namespace App\Http\Controllers;

use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\Vendor;
use App\Models\VendorCategory;
use App\Services\AI\GroqService;
use App\Services\BudgetIntelligenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use RuntimeException;

/**
 * Conversational AI for the couple's own budget page.
 * Can search vendors and return choices for the couple to add themselves.
 */
class AiBudgetChatController extends Controller
{
    public function __construct(
        private readonly GroqService $ai,
        private readonly BudgetIntelligenceService $intelligence,
    )
    {
    }

    public function chat(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'history' => ['nullable', 'array'],
            'history.*.role' => ['in:user,assistant'],
            'history.*.content' => ['string'],
        ]);

        $user = $request->user();
        if (!$this->ai->isConfigured()) {
            abort(503, 'AI is not configured. Add GROQ_API_KEY to backend .env.');
        }

        $categories = BudgetCategory::with('items')->where('user_id', $user->id)
            ->orderBy('position')->get();
        $totalBudget = $user->budget()->first()?->total_budget ?? 0;

        // Guess user's state from wedding_location text (last comma-separated part)
        $userState = null;
        if ($user->wedding_location) {
            $parts = array_map('trim', explode(',', $user->wedding_location));
            $userState = end($parts) ?: null;
        }

        // Give the AI a list of available vendor categories so it can suggest correctly
        $vendorCategories = VendorCategory::orderBy('name')->pluck('name')->all();
        $guests = $user->guest_count ?? 'an unspecified number of';
        $budgetContext = $this->intelligence->analyse($user, $categories, (int) $totalBudget);

        $system = <<<SYS
You are Goldie, a friendly Malaysian wedding budget assistant. The user is
planning a {$user->culture} wedding with a total budget of RM {$totalBudget}
in {$user->wedding_location} for {$guests} guests.

Two jobs each turn:
1. Reply naturally (1-3 sentences).
2. Suggest "actions" the user requested. Available actions:

   Budget shape:
   - { "type": "update_category", "id": <number>, "estimated": <RM> }
   - { "type": "add_category", "name": "string", "icon": "string", "color": "#hex", "estimated": <RM>, "avg_min": <RM>, "avg_max": <RM>, "reason": "brief reason" }
   - { "type": "delete_category", "id": <number> }
   - { "type": "set_total_budget", "amount": <RM> }
   - { "type": "remember_preference", "key": "string", "value": "string or boolean" }

All budget-shape and preference actions are PROPOSALS. Never say they have already been applied.
Explain the reason and let the user accept, edit, or reject each proposal.
Use deterministic_analysis for arithmetic and warnings; do not calculate totals from memory.
When deterministic_analysis contains category_overrun, actual_over_budget, low_catering, or
low_reserve warnings, clearly mention the relevant warning before recommending new spending.
Never describe an over-budget category as affordable or within budget.
For mixed-culture weddings, cover every named culture but combine shared venue, catering,
photography, and decor costs instead of duplicating them.

   Vendor selection — even when the user says "add", "book", or "select", first
   return vendor choices. Never add a vendor from chat without a separate user choice:
   - { "type": "find_and_add_vendor",
       "category_id": <optional number, existing budget category id>,
       "category_name": <optional string, if creating new e.g. "Photography">,
       "vendor_category": <string, one of the platform's vendor categories>,
       "state": <optional string, e.g. "Selangor" — omit to use user's state>,
       "search_query": <optional string, business name hint>,
       "budget_max": <optional number, RM>
     }

   Real vendor suggestions — use this when the user asks to "suggest", "recommend",
   "list", "find" or "search for" vendor options (without automatically booking or adding them to their budget):
   - { "type": "suggest_vendors",
       "vendor_category": <string, one of the platform's vendor categories>,
       "state": <optional string, e.g. "Selangor" — omit to use user's state>,
       "search_query": <optional string, business name or type keyword>,
       "budget_max": <optional number, RM>
     }

   Return [] for actions if user is just asking a question.

Return STRICT JSON: { "reply": "string", "actions": [ ... ] }

Category colours soft pastel (#c4a484, #a8b89a, #b78ba3, #C08E3F).
Category icons: utensils, camera, flower, music, shirt, gem, building, sparkles.

Available vendor categories on the platform: {{VENDOR_CATS}}
SYS;
        $system = str_replace('{{VENDOR_CATS}}', implode(', ', $vendorCategories), $system);

        $messages = [['role' => 'system', 'content' => $system]];
        $messages[] = [
            'role' => 'system',
            'content' => "CURRENT_STATE: " . json_encode([
                'total_budget' => $totalBudget,
                'user_state' => $userState,
                'user_culture' => $user->culture,
                'guest_count' => $user->guest_count,
                'categories' => $categories->map(function ($c) {
                    $bookedName = optional($c->items->first())->name;
                    return [
                        'id' => $c->id,
                        'name' => $c->name,
                        'estimated' => $c->estimated,
                        'booked_vendor' => $bookedName,
                    ];
                })->values(),
                'deterministic_analysis' => $budgetContext,
            ]),
        ];
        foreach (($data['history'] ?? []) as $h) {
            $messages[] = ['role' => $h['role'], 'content' => $h['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $data['message']];

        try {
            $result = $this->ai->chatCompletion($messages, json: true);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }

        $applied = [];
        $proposals = [];
        $suggestions = [];
        $extraNotes = []; // gets appended to the reply when a vendor lookup runs
        $requestHint = $this->inferVendorSearchHint($data['message']);

        DB::transaction(function () use ($user, $result, &$applied, &$proposals, &$suggestions, &$extraNotes, $categories, $userState, $requestHint) {
            foreach (($result['actions'] ?? []) as $a) {
                $type = $a['type'] ?? null;

                // Vendor discovery is always read-only. The user confirms one option in the UI.
                if ($type === 'find_and_add_vendor') {
                    $type = 'suggest_vendors';
                }

                if (in_array($type, ['update_category', 'add_category', 'delete_category', 'set_total_budget', 'remember_preference'], true)) {
                    $proposal = $this->makeProposal($user->id, array_merge($a, ['type' => $type]), $categories);
                    if ($proposal) $proposals[] = $proposal;
                    continue;
                }

                if ($type === 'update_category' && isset($a['id'], $a['estimated'])) {
                    $cat = $categories->firstWhere('id', $a['id']);
                    if ($cat) { $cat->update(['estimated' => max(0, (int) $a['estimated'])]); $applied[] = $a; }

                } elseif ($type === 'add_category' && !empty($a['name'])) {
                    $position = ($user->budgetCategories()->max('position') ?? 0) + 1;
                    BudgetCategory::create([
                        'user_id' => $user->id,
                        'name' => $a['name'],
                        'icon' => $a['icon'] ?? 'sparkles',
                        'color' => $a['color'] ?? '#c4a484',
                        'estimated' => (int) ($a['estimated'] ?? 0),
                        'avg_min' => (int) ($a['avg_min'] ?? 0),
                        'avg_max' => (int) ($a['avg_max'] ?? 0),
                        'position' => $position,
                        'is_ai_generated' => true,
                    ]);
                    $applied[] = $a;

                } elseif ($type === 'delete_category' && isset($a['id'])) {
                    $cat = $categories->firstWhere('id', $a['id']);
                    if ($cat) { $cat->delete(); $applied[] = $a; }

                } elseif ($type === 'set_total_budget' && isset($a['amount'])) {
                    $user->budget()->updateOrCreate(
                        ['user_id' => $user->id],
                        ['total_budget' => (int) $a['amount']],
                    );
                    $applied[] = $a;

                } elseif ($type === 'find_and_add_vendor') {
                    // Resolve or create the budget category first
                    $catId  = $a['category_id']   ?? null;
                    $catNm  = $a['category_name'] ?? null;
                    $budgetCategory = null;

                    if ($catId) {
                        $budgetCategory = $categories->firstWhere('id', $catId)
                            ?? BudgetCategory::where('user_id', $user->id)->find($catId);
                    }
                    if (!$budgetCategory && $catNm) {
                        // Reuse an existing category by name if possible
                        $budgetCategory = BudgetCategory::where('user_id', $user->id)
                            ->whereRaw('LOWER(name) = ?', [mb_strtolower($catNm)])->first();
                        if (!$budgetCategory) {
                            $position = ($user->budgetCategories()->max('position') ?? 0) + 1;
                            $budgetCategory = BudgetCategory::create([
                                'user_id' => $user->id,
                                'name' => $catNm,
                                'icon' => 'sparkles',
                                'color' => '#C08E3F',
                                'estimated' => 0,
                                'position' => $position,
                                'is_ai_generated' => true,
                            ]);
                        }
                    }
                    if (!$budgetCategory) {
                        $extraNotes[] = "Could not add a vendor without a category.";
                        continue;
                    }

                    // Search the real vendors table
                    $vendor = $this->findBestVendor([
                        'vendor_category' => $a['vendor_category'] ?? $budgetCategory->name,
                        'state'           => $a['state']           ?? $userState,
                        'culture'         => $user->culture,
                        'search_query'    => $a['search_query']    ?? null,
                        'budget_max'      => isset($a['budget_max']) ? (int) $a['budget_max'] : null,
                    ]);

                    if (!$vendor) {
                        $categoryName = $a['vendor_category'] ?? $budgetCategory->name;
                        $stateName = $a['state'] ?? $userState ?? 'Malaysia';
                        $budgetMax = isset($a['budget_max']) ? (int) $a['budget_max'] : ($budgetCategory->estimated ?: 3000);
                        $searchQuery = $a['search_query'] ?? null;

                        if ($searchQuery) {
                            // User asked for a specific vendor. Let's look up info for that specific vendor!
                            $fallbackSystem = "You are a helpful Malaysian wedding planner assistant. The user wants to add a specific vendor named '{$searchQuery}' in the '{$categoryName}' category (operates in/around {$stateName}) to their budget.\n\nSince we do not have this vendor registered on our site, lookup or estimate real details for '{$searchQuery}'. If it is a real place/vendor (e.g. a restaurant or caterer), return its real details. Otherwise, return reasonable wedding starting estimates for it.\n\nReturn a JSON object with this exact structure:\n{\n  \"vendor\": {\n    \"name\": \"string (official business name)\",\n    \"area\": \"string (specific city/neighborhood, e.g. Johor Bahru)\",\n    \"price_from\": number (starting cost or package starting price in RM),\n    \"price_to\": number (average high cost in RM),\n    \"link\": \"string (official website or Google Maps search link)\"\n  }\n}";
                            $fallbackUser = "Lookup details for vendor '{$searchQuery}' in category '{$categoryName}' in/around {$stateName}.";

                            try {
                                $jsonResult = $this->ai->chatCompletion([
                                    ['role' => 'system', 'content' => $fallbackSystem],
                                    ['role' => 'user', 'content' => $fallbackUser]
                                ], json: true);

                                $fv = $jsonResult['vendor'] ?? null;
                                if ($fv && !empty($fv['name'])) {
                                    $linkUrl = $fv['link'] ?? "https://www.google.com/search?q=" . urlencode($fv['name'] . ' ' . ($fv['area'] ?? $stateName));

                                    // Clear existing items in this category
                                    $budgetCategory->items()->delete();

                                    BudgetItem::create([
                                        'user_id' => $user->id,
                                        'budget_category_id' => $budgetCategory->id,
                                        'name' => $fv['name'],
                                        'source_type' => 'manual',
                                        'source_id' => null,
                                        'estimated' => (int) ($fv['price_from'] ?? 0),
                                        'position' => 1,
                                        'notes' => json_encode([
                                            'location' => ($fv['area'] ?? $stateName) . ', ' . $stateName,
                                            'services' => $categoryName,
                                            'price_range' => "RM " . number_format($fv['price_from'] ?? 0) . " - RM " . number_format($fv['price_to'] ?? 0),
                                            'rating' => 'No ratings yet',
                                            'link' => $linkUrl,
                                        ]),
                                    ]);

                                    if ($budgetCategory->estimated == 0) {
                                        $budgetCategory->update(['estimated' => (int) ($fv['price_from'] ?? 0)]);
                                    }

                                    $applied[] = [
                                        'type'          => 'find_and_add_vendor',
                                        'vendor_name'   => $fv['name'],
                                        'vendor_state'  => $stateName,
                                        'vendor_area'   => $fv['area'] ?? $stateName,
                                        'vendor_price'  => $fv['price_from'] ?? 0,
                                        'category_name' => $budgetCategory->name,
                                    ];

                                    $extraNotes[] = "I couldn't find a registered profile for **{$searchQuery}** in our directory. However, I have added it as a manual vendor to your dashboard:\n\n* **{$fv['name']}** ({$fv['area']}) — Starting from RM " . number_format($fv['price_from']) . ". [View Info]({$linkUrl})";
                                } else {
                                    $extraNotes[] = "Could not find details for vendor '{$searchQuery}'.";
                                }
                            } catch (\Exception $e) {
                                $extraNotes[] = "Failed looking up details for '{$searchQuery}': " . $e->getMessage();
                            }
                            continue;
                        }

                        // Original general 3 suggestions fallback when no specific search query was requested
                        $fallbackSystem = "You are a helpful Malaysian wedding planner assistant. The user wants to find a {$categoryName} vendor in {$stateName} for their {$user->culture} wedding, with a maximum budget of RM {$budgetMax}.\n\nSince we do not have verified vendors registered on our site in this location, suggest 3 realistic, well-known, or popular local {$categoryName} vendors (shops, brands, or freelancers) that operate in or around {$stateName} and are suitable for a {$user->culture} wedding.\n\nAmong the 3, select the best one that is top-rated/recommended AND strictly has a starting price within the budget limit of RM {$budgetMax}.\n\nReturn a JSON object with this exact structure:\n{\n  \"vendors\": [\n    {\n      \"name\": \"string\",\n      \"area\": \"string\",\n      \"price_from\": number,\n      \"price_to\": number,\n      \"link\": \"string\"\n    }\n  ],\n  \"selected_index\": number (index of the chosen vendor to add to the dashboard. The selected vendor MUST have price_from <= {$budgetMax})\n}";
                        $fallbackUser = "Suggest 3 local {$categoryName} vendors in {$stateName} suitable for a {$user->culture} wedding with max budget RM {$budgetMax}.";

                        try {
                            $jsonResult = $this->ai->chatCompletion([
                                ['role' => 'system', 'content' => $fallbackSystem],
                                ['role' => 'user', 'content' => $fallbackUser]
                            ], json: true);

                            $fallbackVendors = $jsonResult['vendors'] ?? [];
                            $selectedIndex = isset($jsonResult['selected_index']) ? (int) $jsonResult['selected_index'] : 0;

                            if (!empty($fallbackVendors)) {
                                $lines = [];
                                foreach ($fallbackVendors as $idx => $fv) {
                                    $num = $idx + 1;
                                    $priceRange = "RM " . number_format($fv['price_from'] ?? 0) . " - RM " . number_format($fv['price_to'] ?? 0);
                                    $linkUrl = $fv['link'] ?? "https://www.google.com/search?q=" . urlencode($fv['name'] . ' ' . ($fv['area'] ?? $stateName));
                                    $lines[] = "{$num}. **{$fv['name']}**, {$fv['area']}, {$priceRange}, [View Info]({$linkUrl})";
                                }

                                // Clear existing items in this category to prevent duplicate/bloated options
                                $budgetCategory->items()->delete();

                                // Create manual budget items for ALL 3 suggested options
                                foreach ($fallbackVendors as $idx => $fv) {
                                    $linkUrl = $fv['link'] ?? "https://www.google.com/search?q=" . urlencode($fv['name'] . ' ' . ($fv['area'] ?? $stateName));
                                    BudgetItem::create([
                                        'user_id' => $user->id,
                                        'budget_category_id' => $budgetCategory->id,
                                        'name' => $fv['name'],
                                        'source_type' => 'manual',
                                        'source_id' => null,
                                        'estimated' => (int) ($fv['price_from'] ?? 0),
                                        'position' => ($budgetCategory->items()->max('position') ?? 0) + 1,
                                        'notes' => json_encode([
                                            'location' => ($fv['area'] ?? $stateName) . ', ' . $stateName,
                                            'services' => $categoryName,
                                            'price_range' => "RM " . number_format($fv['price_from'] ?? 0) . " - RM " . number_format($fv['price_to'] ?? 0),
                                            'rating' => 'No ratings yet',
                                            'link' => $linkUrl,
                                        ]),
                                    ]);

                                    $applied[] = [
                                        'type'          => 'find_and_add_vendor',
                                        'vendor_name'   => $fv['name'],
                                        'vendor_state'  => $stateName,
                                        'vendor_area'   => $fv['area'] ?? $stateName,
                                        'vendor_price'  => $fv['price_from'] ?? 0,
                                        'category_name' => $budgetCategory->name,
                                    ];
                                }

                                // Set category estimate to the first suggested minimum price if currently 0
                                if ($budgetCategory->estimated == 0) {
                                    $budgetCategory->update(['estimated' => (int) ($fallbackVendors[0]['price_from'] ?? 0)]);
                                }

                                $extraNotes[] = "I couldn't find any registered {$categoryName} vendors in {$stateName} in our directory. However, I have added these 3 local options suitable for your {$user->culture} wedding to your dashboard for your consideration:\n\n"
                                    . implode("\n", $lines)
                                    . "\n\n⚠️ *Note: The suggested options above are not registered in Golden Promise. Please check for legitimacy and shop at your own risk.*";
                            } else {
                                $extraNotes[] = "No verified vendor found in the directory for {$categoryName} in {$stateName}.";
                            }
                        } catch (\Exception $e) {
                            $extraNotes[] = "No verified vendor found in the directory for {$categoryName} in {$stateName}.";
                        }
                        continue;
                    }

                    // Clear existing items in this category before adding the new booked vendor
                    $budgetCategory->items()->delete();

                    // Create the budget item linking the real vendor
                    $item = BudgetItem::create([
                        'user_id' => $user->id,
                        'budget_category_id' => $budgetCategory->id,
                        'name' => $vendor->name,
                        'source_type' => 'vendor',
                        'source_id' => $vendor->id,
                        'source_slug' => $vendor->slug,
                        'image' => $vendor->photos[0] ?? null,
                        'estimated' => (int) ($vendor->price_from ?? 0),
                        'position' => ($budgetCategory->items()->max('position') ?? 0) + 1,
                    ]);

                    // Bump the category estimate to at least the vendor's price
                    if ((int) $vendor->price_from > $budgetCategory->estimated) {
                        $budgetCategory->update(['estimated' => (int) $vendor->price_from]);
                    }

                    $applied[] = array_merge($a, [
                        'vendor_name'   => $vendor->name,
                        'vendor_state'  => $vendor->state,
                        'vendor_area'   => $vendor->area,
                        'vendor_price'  => $vendor->price_from,
                        'category_name' => $budgetCategory->name,
                    ]);
                    $extraNotes[] = "Added {$vendor->name} ({$vendor->area}, {$vendor->state}) for RM " . number_format($vendor->price_from ?? 0) . ".";

                } elseif ($type === 'suggest_vendors') {
                    $searchHint = $a['search_query'] ?? $requestHint;
                    $vendors = $this->findMultipleVendors([
                        'vendor_category' => $a['vendor_category'] ?? null,
                        'state'           => $a['state']           ?? $userState,
                        'culture'         => $user->culture,
                        'search_query'    => $searchHint,
                        'budget_max'      => isset($a['budget_max']) ? (int) $a['budget_max'] : null,
                    ], 3);

                    $lines = [];
                    $categoryName = $a['category_name'] ?? $a['vendor_category'] ?? 'Wedding Vendor';
                    $budgetCategory = !empty($a['category_id'])
                        ? $categories->firstWhere('id', (int) $a['category_id'])
                        : $categories->first(function ($category) use ($a, $categoryName) {
                            $current = rtrim(mb_strtolower($category->name), 's');
                            $wanted = rtrim(mb_strtolower($a['vendor_category'] ?? $categoryName), 's');
                            return str_contains($current, $wanted) || str_contains($wanted, $current);
                        });

                    if (!$vendors->isEmpty()) {
                        $lines[] = "Here are verified options from our directory. Choose one below if you want to add it to your budget:";
                        foreach ($vendors as $idx => $v) {
                            $num = $idx + 1;
                            $price = $v->price_from ? "from RM " . number_format($v->price_from) : "Price on request";
                            $rating = $v->rating ? "★ " . number_format($v->rating, 1) : "No ratings yet";
                            // Registered vendors have clickable links to their profile page!
                            $lines[] = "{$num}. **[{$v->name}](/vendor/{$v->slug})** ({$v->area}, {$v->state}) — {$price} ({$rating})";
                            $suggestions[] = [
                                'key' => 'vendor-' . $v->id,
                                'source_type' => 'vendor',
                                'source_id' => $v->id,
                                'category_id' => $budgetCategory?->id,
                                'category_name' => $budgetCategory?->name ?? $categoryName,
                                'name' => $v->name,
                                'location' => implode(', ', array_filter([$v->area, $v->state])),
                                'price_from' => (int) ($v->price_from ?? 0),
                                'price_to' => (int) ($v->price_to ?? 0),
                                'rating' => $v->rating ? number_format($v->rating, 1) : null,
                                'match_score' => (int) ($v->match_score ?? 0),
                                'link' => "/vendor/{$v->slug}",
                                'is_registered' => true,
                            ];
                        }
                    }

                    $neededCount = 3 - $vendors->count();
                    if ($neededCount > 0) {
                        $stateName = $a['state'] ?? $userState ?? 'Malaysia';
                        $requestedType = $searchHint ?: $categoryName;
                        $mapsQuery = trim("{$requestedType} wedding vendor {$stateName} Malaysia");
                        $mapsLink = 'https://www.google.com/maps/search/?api=1&query=' . urlencode($mapsQuery);
                        if (!$vendors->isEmpty()) $lines[] = "";
                        $lines[] = "I could not find more verified Golden Promise listings matching those details. [Search this service on Google Maps]({$mapsLink}) to explore external businesses and verify them before contacting or booking.";
                    }

                    $extraNotes[] = "\n" . implode("\n", $lines);
                }
            }
        });

        $reply = !empty($suggestions)
            ? 'I found these options matching your request. Review them and choose one only if you want to add it to your budget.'
            : trim($result['reply'] ?? 'OK');
        if (!empty($extraNotes)) {
            $reply .= "\n\n" . implode(' ', $extraNotes);
        }

        return response()->json([
            'reply' => $reply,
            'applied' => $applied,
            'proposals' => $proposals,
            'suggestions' => $suggestions,
            'intelligence' => $budgetContext,
        ]);
    }

    public function applyProposal(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'amount' => ['nullable', 'integer', 'min:0'],
        ]);

        try {
            $proposal = json_decode(Crypt::decryptString($data['token']), true, flags: JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            abort(422, 'This proposal is invalid or has expired.');
        }

        $user = $request->user();
        abort_unless((int) ($proposal['user_id'] ?? 0) === $user->id, 403);
        abort_if(now()->timestamp - (int) ($proposal['created_at'] ?? 0) > 3600, 422, 'This proposal has expired. Ask Goldie again.');

        $action = $proposal['action'] ?? [];
        $type = $action['type'] ?? null;
        if (isset($data['amount']) && in_array($type, ['update_category', 'add_category', 'set_total_budget'], true)) {
            $action[$type === 'set_total_budget' ? 'amount' : 'estimated'] = $data['amount'];
        }

        DB::transaction(function () use ($user, $action, $type) {
            if ($type === 'set_total_budget') {
                $user->budget()->updateOrCreate(['user_id' => $user->id], ['total_budget' => (int) ($action['amount'] ?? 0)]);
                return;
            }

            if ($type === 'update_category') {
                $category = $user->budgetCategories()->findOrFail((int) ($action['id'] ?? 0));
                $category->update(['estimated' => (int) ($action['estimated'] ?? 0)]);
                return;
            }

            if ($type === 'add_category') {
                $user->budgetCategories()->create([
                    'name' => mb_substr((string) ($action['name'] ?? 'New category'), 0, 100),
                    'icon' => $action['icon'] ?? 'sparkles',
                    'color' => $action['color'] ?? '#C08E3F',
                    'estimated' => (int) ($action['estimated'] ?? 0),
                    'avg_min' => (int) ($action['avg_min'] ?? 0),
                    'avg_max' => (int) ($action['avg_max'] ?? 0),
                    'position' => ($user->budgetCategories()->max('position') ?? 0) + 1,
                    'is_ai_generated' => true,
                ]);
                return;
            }

            if ($type === 'delete_category') {
                $category = $user->budgetCategories()->findOrFail((int) ($action['id'] ?? 0));
                abort_if($category->items()->exists(), 422, 'Remove or move its saved vendors before deleting this category.');
                $category->delete();
                return;
            }

            if ($type === 'remember_preference') {
                $key = mb_substr(preg_replace('/[^a-z0-9_]/', '_', mb_strtolower((string) ($action['key'] ?? 'preference'))), 0, 50);
                $preferences = $user->budget_preferences ?? [];
                $preferences[$key] = is_scalar($action['value'] ?? null) ? $action['value'] : json_encode($action['value'] ?? null);
                $user->update(['budget_preferences' => $preferences]);
                return;
            }

            abort(422, 'Unsupported proposal.');
        });

        return response()->json(['message' => 'Proposal applied.']);
    }

    private function makeProposal(int $userId, array $action, $categories): ?array
    {
        $type = $action['type'] ?? null;
        $category = isset($action['id']) ? $categories->firstWhere('id', (int) $action['id']) : null;
        $label = match ($type) {
            'set_total_budget' => 'Set total budget',
            'update_category' => 'Update ' . ($category?->name ?? 'category'),
            'add_category' => 'Add ' . ($action['name'] ?? 'category'),
            'delete_category' => 'Remove ' . ($category?->name ?? 'category'),
            'remember_preference' => 'Remember this preference',
            default => null,
        };
        if (!$label) return null;

        $amount = match ($type) {
            'set_total_budget' => (int) ($action['amount'] ?? 0),
            'update_category', 'add_category' => (int) ($action['estimated'] ?? 0),
            default => null,
        };
        $token = Crypt::encryptString(json_encode([
            'user_id' => $userId,
            'created_at' => now()->timestamp,
            'action' => $action,
        ], JSON_THROW_ON_ERROR));

        return [
            'token' => $token,
            'type' => $type,
            'label' => $label,
            'amount' => $amount,
            'reason' => $action['reason'] ?? null,
            'preference' => $type === 'remember_preference' ? ($action['value'] ?? null) : null,
        ];
    }

    private function inferVendorSearchHint(string $message): ?string
    {
        $message = mb_strtolower($message);
        $hints = [
            'hindu temple', 'temple', 'church', 'mosque', 'gurdwara', 'hotel',
            'resort', 'ballroom', 'banquet hall', 'community hall', 'garden',
            'beach', 'restaurant', 'rooftop', 'photographer', 'videographer',
            'florist', 'caterer', 'makeup artist', 'henna artist', 'dj', 'band',
        ];

        foreach ($hints as $hint) {
            if (str_contains($message, $hint)) {
                return $hint;
            }
        }

        return null;
    }

    /**
     * Find multiple matching approved vendors.
     */
    private function findMultipleVendors(array $filters, int $limit = 3)
    {
        $query = Vendor::query()
            ->where('is_approved', true)
            ->with('category');

        $catHint = $filters['vendor_category'] ?? null;
        if ($catHint) {
            $cat = VendorCategory::whereRaw('LOWER(name) LIKE ?', ['%' . mb_strtolower($catHint) . '%'])
                ->orWhereRaw('LOWER(slug) LIKE ?', ['%' . mb_strtolower($catHint) . '%'])
                ->first();
            if ($cat) {
                $query->where('vendor_category_id', $cat->id);
            }
        }

        if (!empty($filters['state'])) {
            $query->where('state', 'ILIKE', '%' . $filters['state'] . '%');
        }

        if (!empty($filters['search_query'])) {
            $q = $filters['search_query'];
            $query->where(function ($w) use ($q) {
                $w->where('name', 'ILIKE', "%{$q}%")
                  ->orWhere('bio', 'ILIKE', "%{$q}%");
            });
        }

        if (!empty($filters['budget_max'])) {
            $query->where(function ($w) use ($filters) {
                $w->whereNull('price_from')->orWhere('price_from', '<=', $filters['budget_max']);
            });
        }

        return $query->limit(30)->get()
            ->map(function ($vendor) use ($filters) {
                $vendor->match_score = $this->intelligence->scoreVendor($vendor, $filters);
                return $vendor;
            })
            ->sortByDesc('match_score')
            ->take($limit)
            ->values();
    }

    /**
     * Find the best-matching approved vendor for the given hints.
     * Scoring priority: state match → culture match → search query → price cap
     *                 → is_golpro → rating desc.
     */
    private function findBestVendor(array $filters): ?Vendor
    {
        $query = Vendor::query()
            ->where('is_approved', true)
            ->with('category');

        // Category via VendorCategory name — soft LIKE match, robust to variations
        $catHint = $filters['vendor_category'] ?? null;
        if ($catHint) {
            $cat = VendorCategory::whereRaw('LOWER(name) LIKE ?', ['%' . mb_strtolower($catHint) . '%'])
                ->orWhereRaw('LOWER(slug) LIKE ?', ['%' . mb_strtolower($catHint) . '%'])
                ->first();
            if ($cat) {
                $query->where('vendor_category_id', $cat->id);
            }
        }

        // State — same soft LIKE
        if (!empty($filters['state'])) {
            $query->where('state', 'ILIKE', '%' . $filters['state'] . '%');
        }

        // Search query — match against name / bio
        if (!empty($filters['search_query'])) {
            $q = $filters['search_query'];
            $query->where(function ($w) use ($q) {
                $w->where('name', 'ILIKE', "%{$q}%")
                  ->orWhere('bio', 'ILIKE', "%{$q}%");
            });
        }

        // Budget cap
        if (!empty($filters['budget_max'])) {
            $query->where(function ($w) use ($filters) {
                $w->whereNull('price_from')->orWhere('price_from', '<=', $filters['budget_max']);
            });
        }

        // Culture / religion focus — Postgres JSON contains
        if (!empty($filters['culture'])) {
            $query->where(function ($w) use ($filters) {
                $w->whereJsonContains('religion_focus', $filters['culture'])
                  ->orWhereNull('religion_focus');
            });
        }

        // Rank: featured → GolPro → rating
        return $query->orderByDesc('is_verified')
            ->orderByDesc('is_golpro')
            ->orderByDesc('rating')
            ->first();
    }
}
