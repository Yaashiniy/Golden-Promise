<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        // morphWith so a favourited vendor arrives with its category, which the
        // dashboard card uses for its label (plain with() can't reach nested
        // relations through a morphTo).
        $favs = $request->user()->favorites()
            ->with(['favoritable' => fn (MorphTo $morphTo) => $morphTo->morphWith([
                Vendor::class => ['category'],
            ])])
            ->latest()
            ->get();
        return $favs->map(fn ($f) => [
            'id' => $f->id,
            'type' => class_basename($f->favoritable_type),
            'item' => $f->favoritable,
        ]);
    }

    public function toggle(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'in:venue,vendor'],
            'id' => ['required', 'integer'],
        ]);

        $modelClass = Vendor::class;
        $model = $modelClass::find($data['id']);
        abort_if(!$model, 404);

        $existing = $request->user()->favorites()
            ->where('favoritable_type', $modelClass)
            ->where('favoritable_id', $model->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['favorited' => false]);
        }

        $request->user()->favorites()->create([
            'favoritable_type' => $modelClass,
            'favoritable_id' => $model->id,
        ]);
        return response()->json(['favorited' => true]);
    }
}
