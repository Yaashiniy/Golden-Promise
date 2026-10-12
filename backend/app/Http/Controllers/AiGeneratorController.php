<?php

namespace App\Http\Controllers;

use App\Models\BudgetCategory;
use App\Services\PlannerGeneratorService;
use Illuminate\Http\Request;
use RuntimeException;

class AiGeneratorController extends Controller
{
    public function __construct(private readonly PlannerGeneratorService $generator)
    {
    }

    /** Generate a culture-specific checklist grouped into sections. */
    public function checklist(Request $request)
    {
        $user = $request->user();
        abort_if(!$user->culture, 422, 'Please set your culture in your profile first.');

        try {
            $count = $this->generator->generateChecklist($user);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }

        $sections = $user->checklistItems()->where('is_ai_generated', true)
            ->distinct()->pluck('section')->all();

        return response()->json([
            'generated_count' => $count,
            'sections' => $sections,
        ]);
    }

    /** Generate culture-appropriate budget categories sized to the user's total budget. */
    public function budget(Request $request)
    {
        $user = $request->user();
        abort_if(!$user->culture, 422, 'Please set your culture in your profile first.');

        $totalBudget = (int) $request->integer('total_budget');
        abort_if($totalBudget < 1000, 422, 'Please set a realistic total budget.');

        try {
            $count = $this->generator->generateBudget($user, $totalBudget);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }

        return response()->json([
            'count' => $count,
            'categories' => BudgetCategory::where('user_id', $user->id)->orderBy('position')->get(),
        ]);
    }
}
