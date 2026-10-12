<?php

namespace App\Http\Controllers;

use App\Models\ChecklistItem;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->checklistItems()->orderBy('position')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'section' => ['nullable', 'string', 'max:80'],
            'due_date' => ['nullable', 'date'],
        ]);
        $maxPosition = $request->user()->checklistItems()->max('position') ?? 0;
        $item = $request->user()->checklistItems()->create([
            'title' => $data['title'],
            'section' => $data['section'] ?? null,
            'due_date' => $data['due_date'] ?? null,
            'position' => $maxPosition + 1,
        ]);
        return response()->json($item, 201);
    }

    public function update(Request $request, ChecklistItem $item)
    {
        $this->authorizeOwner($request, $item);
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'section' => ['sometimes', 'nullable', 'string', 'max:80'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'is_completed' => ['sometimes', 'boolean'],
        ]);
        $item->update($data);
        return response()->json($item);
    }

    public function destroy(Request $request, ChecklistItem $item)
    {
        $this->authorizeOwner($request, $item);
        $item->delete();
        return response()->json(['ok' => true]);
    }

    private function authorizeOwner(Request $request, ChecklistItem $item): void
    {
        abort_if($item->user_id !== $request->user()->id, 403);
    }
}
