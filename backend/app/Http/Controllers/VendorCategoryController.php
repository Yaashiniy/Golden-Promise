<?php

namespace App\Http\Controllers;

use App\Models\VendorCategory;

class VendorCategoryController extends Controller
{
    public function index()
    {
        return VendorCategory::query()
            ->where('slug', '!=', 'venues')
            ->orderBy('position')
            ->get();
    }
}
