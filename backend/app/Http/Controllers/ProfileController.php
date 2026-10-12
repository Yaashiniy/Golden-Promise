<?php

namespace App\Http\Controllers;

use App\Services\PlannerGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function __construct(private readonly PlannerGeneratorService $generator)
    {
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'partner_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'wedding_date' => ['sometimes', 'nullable', 'date'],
            'culture' => ['sometimes', 'nullable', 'string', 'max:100'],
            'guest_count' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'wedding_location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'budget' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'onboarded' => ['sometimes', 'boolean'],
        ]);

        $budgetAmount = $data['budget'] ?? null;
        unset($data['budget']);

        $wasGeneratedBefore = (bool) $user->checklist_auto_generated;
        
        $user->update($data);

        if ($budgetAmount !== null) {
            $user->budget()->updateOrCreate(
                ['user_id' => $user->id],
                ['total_budget' => $budgetAmount]
            );
        }

        if (!$wasGeneratedBefore && $user->culture && $user->wedding_date) {
            try {
                $this->generator->generateChecklist($user);
                $user->update(['checklist_auto_generated' => true]);
            } catch (\Exception $e) {
                logger()->error('Checklist auto-generation failed: ' . $e->getMessage());
            }
        }

        if ($user->culture && !$user->budgetCategories()->exists()) {
            $savedBudget = $user->budget()->firstOrCreate(
                ['user_id' => $user->id],
                ['total_budget' => 30000]
            );
            $totalBudget = (int) $savedBudget->total_budget;
            if ($totalBudget < 1000) {
                $totalBudget = 30000;
                $savedBudget->update(['total_budget' => $totalBudget]);
            }

            try {
                $this->generator->generateBudget($user, $totalBudget);
            } catch (\Exception $e) {
                logger()->error('Budget auto-generation failed: ' . $e->getMessage());
            }
        }

        return response()->json($user->fresh());
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);
        $user = $request->user();
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }
        $path = $request->file('photo')->store("profiles/{$user->id}", 'public');
        $user->update(['photo_path' => $path]);
        return response()->json($user->fresh());
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 422);
        }

        if ($user->isVendor() && $user->vendor) {
            $user->vendor->delete();
        }

        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['ok' => true]);
    }
}
