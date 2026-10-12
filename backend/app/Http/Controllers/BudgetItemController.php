<?php

namespace App\Http\Controllers;

use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\Vendor;
use Illuminate\Http\Request;

/**
 * "Add to Budget" — couples shortlist venues/vendors under a budget category to compare.
 * No transactions happen here; this is just their private planning list.
 */
class BudgetItemController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'source_type' => ['required', 'in:venue,vendor,custom'],
            'source_id' => ['nullable', 'integer'],
            'category_name' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:budget_categories,id'],
            'name' => ['nullable', 'string', 'max:200'],
            'estimated' => ['nullable', 'integer', 'min:0'],
            'actual_cost' => ['nullable', 'integer', 'min:0'],
            'paid_amount' => ['nullable', 'integer', 'min:0'],
            'paid' => ['nullable', 'boolean'],
            'payment_due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);
        if (($data['paid'] ?? false) && isset($data['actual_cost'])) {
            $data['paid_amount'] = $data['actual_cost'];
        }

        $user = $request->user();
        $resolved = $this->resolveSource($data['source_type'] ?? null, $data['source_id'] ?? null);
        $category = $this->resolveCategory($user, $data);

        $item = BudgetItem::create([
            'user_id' => $user->id,
            'budget_category_id' => $category->id,
            'name' => $data['name'] ?? $resolved['name'] ?? 'Item',
            'source_type' => $data['source_type'],
            'source_id' => $data['source_id'] ?? null,
            'source_slug' => $resolved['slug'] ?? null,
            'image' => $resolved['image'] ?? null,
            'estimated' => $data['estimated'] ?? $resolved['price'] ?? 0,
            'actual_cost' => $data['actual_cost'] ?? 0,
            'paid_amount' => $data['paid_amount'] ?? 0,
            'paid' => $data['paid'] ?? false,
            'payment_due_date' => $data['payment_due_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'position' => ($category->items()->max('position') ?? 0) + 1,
        ]);

        return response()->json([
            'item' => $item,
            'category' => $category->fresh()->load('items'),
        ], 201);
    }

    public function update(Request $request, BudgetItem $item)
    {
        abort_if($item->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:200'],
            'estimated' => ['sometimes', 'integer', 'min:0'],
            'actual_cost' => ['sometimes', 'integer', 'min:0'],
            'paid_amount' => ['sometimes', 'integer', 'min:0'],
            'paid' => ['sometimes', 'boolean'],
            'payment_due_date' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:500'],
            'is_shortlisted' => ['sometimes', 'boolean'],
            'budget_category_id' => ['sometimes', 'integer', 'exists:budget_categories,id'],
        ]);
        if (($data['paid'] ?? false) && isset($data['actual_cost'])) {
            $data['paid_amount'] = $data['actual_cost'];
        }
        $item->update($data);
        return response()->json($item->fresh());
    }

    public function destroy(Request $request, BudgetItem $item)
    {
        abort_if($item->user_id !== $request->user()->id, 403);
        $item->delete();
        return response()->json(['ok' => true]);
    }

    private function resolveSource(?string $type, $id): array
    {
        if (!$type || $type === 'custom' || !$id) return [];
        $model = match ($type) {
            'venue', 'vendor' => Vendor::find($id),
            default => null,
        };
        if (!$model) return [];
        return [
            'name' => $model->name,
            'slug' => $model->slug,
            'price' => (int) $model->price_from,
            'image' => $model->image ?? null,
        ];
    }

    private function resolveCategory($user, array $data): BudgetCategory
    {
        if (!empty($data['category_id'])) {
            $cat = BudgetCategory::where('user_id', $user->id)->find($data['category_id']);
            if ($cat) return $cat;
        }

        if (!empty($data['category_name'])) {
            return BudgetCategory::firstOrCreate(
                ['user_id' => $user->id, 'name' => $data['category_name']],
                [
                    'icon' => 'sparkles', 'color' => '#c4a484',
                    'estimated' => 0, 'avg_min' => 0, 'avg_max' => 0,
                    'position' => ($user->budgetCategories()->max('position') ?? 0) + 1,
                ],
            );
        }

        $defaultName = ($data['source_type'] ?? null) === 'venue' ? 'Venue' : 'Vendors';
        return BudgetCategory::firstOrCreate(
            ['user_id' => $user->id, 'name' => $defaultName],
            [
                'icon' => ($data['source_type'] ?? null) === 'venue' ? 'building' : 'sparkles',
                'color' => ($data['source_type'] ?? null) === 'venue' ? '#a8b89a' : '#b78ba3',
                'estimated' => 0, 'avg_min' => 0, 'avg_max' => 0,
                'position' => ($user->budgetCategories()->max('position') ?? 0) + 1,
            ],
        );
    }
}
