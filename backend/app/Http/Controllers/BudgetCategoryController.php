<?php

namespace App\Http\Controllers;

use App\Models\BudgetCategory;
use Illuminate\Http\Request;

class BudgetCategoryController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->budgetCategories()->orderBy('position')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:40'],
            'color' => ['nullable', 'string', 'max:7'],
            'estimated' => ['required', 'integer', 'min:0'],
            'avg_min' => ['nullable', 'integer', 'min:0'],
            'avg_max' => ['nullable', 'integer', 'min:0'],
        ]);
        $position = ($request->user()->budgetCategories()->max('position') ?? 0) + 1;
        $cat = $request->user()->budgetCategories()->create([
            ...$data,
            'position' => $position,
            'icon' => $data['icon'] ?? 'sparkles',
            'color' => $data['color'] ?? '#c4a484',
        ]);
        return response()->json($cat, 201);
    }

    public function update(Request $request, BudgetCategory $category)
    {
        abort_if($category->user_id !== $request->user()->id, 403);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'icon' => ['sometimes', 'string', 'max:40'],
            'color' => ['sometimes', 'string', 'max:7'],
            'estimated' => ['sometimes', 'integer', 'min:0'],
            'avg_min' => ['sometimes', 'integer', 'min:0'],
            'avg_max' => ['sometimes', 'integer', 'min:0'],
            'position' => ['sometimes', 'integer'],
        ]);
        $category->update($data);
        return response()->json($category->fresh());
    }

    public function destroy(Request $request, BudgetCategory $category)
    {
        abort_if($category->user_id !== $request->user()->id, 403);
        $category->delete();
        return response()->json(['ok' => true]);
    }
}
