<?php

use App\Http\Controllers\AdminRevenueController;
use App\Http\Controllers\AiBudgetChatController;
use App\Http\Controllers\AiGeneratorController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetCategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\BudgetItemController;
use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VendorAnalyticsController;
use App\Http\Controllers\VendorApplicationController;
use App\Http\Controllers\VendorCategoryController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VenueController;
use App\Http\Controllers\StripePaymentController;
use Illuminate\Support\Facades\Route;

// Auth (couples only self-signup; vendors go through application)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register-vendor', [AuthController::class, 'registerVendor']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

// Admin standalone auth (pure token-based, ignores web session)
Route::post('/admin-auth/login', [\App\Http\Controllers\AdminAuthController::class, 'login']);

// Public catalog
Route::get('/venues', [VenueController::class, 'index']);
Route::get('/venues/areas', [VenueController::class, 'areas']);
Route::get('/venues/states', [VenueController::class, 'states']);
Route::get('/venues/filters', [VenueController::class, 'filters']);
Route::get('/venues/{venue:slug}', [VenueController::class, 'show']);
Route::post('/venues/{venue:slug}/track-whatsapp', [VenueController::class, 'trackWhatsapp']);

Route::get('/vendor-categories', [VendorCategoryController::class, 'index']);
Route::get('/vendors', [VendorController::class, 'index']);
Route::get('/vendors/filters', [VendorController::class, 'filters']);
Route::get('/vendors/{vendor:slug}', [VendorController::class, 'show']);
Route::post('/vendors/{vendor:slug}/track-social-click', [VendorController::class, 'trackSocialClick']);
Route::post('/vendors/{vendor:slug}/track-view', [VendorController::class, 'trackView']);

// Vendor applications (public submit + status check)
Route::post('/vendor-applications', [VendorApplicationController::class, 'store']);
Route::post('/vendor-applications/check-email', [VendorApplicationController::class, 'checkEmail']);
Route::post('/vendor-applications/status', [VendorApplicationController::class, 'status']);
Route::post('/vendor-applications/{application}/resubmit', [VendorApplicationController::class, 'resubmit']);

// Stripe public success callback
Route::post('/vendor-portal/checkout-success', [StripePaymentController::class, 'checkoutSuccess']);

// Public platform info
Route::get('/platform', fn () => [
    'name' => config('platform.name'),
    'currency' => config('platform.currency'),
    'currency_symbol' => config('platform.currency_symbol'),
    'model' => 'directory',
]);

// Authenticated
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/admin-auth/logout', [\App\Http\Controllers\AdminAuthController::class, 'logout']);
    Route::get('/admin-auth/me', [\App\Http\Controllers\AdminAuthController::class, 'me']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // Couple-only
    Route::middleware('role:couple,admin')->group(function () {
        // Budget
        Route::get('/budget', [BudgetController::class, 'show']);
        Route::put('/budget', [BudgetController::class, 'setTotal']);
        Route::get('/budget/top-matches', [BudgetController::class, 'topMatches']);
        Route::post('/budget/expenses', [BudgetController::class, 'storeExpense']);
        Route::put('/budget/expenses/{expense}', [BudgetController::class, 'updateExpense']);
        Route::delete('/budget/expenses/{expense}', [BudgetController::class, 'destroyExpense']);

        // AI smart generators (by culture)
        Route::post('/ai/generate-checklist', [AiGeneratorController::class, 'checklist']);
        Route::post('/ai/generate-budget', [AiGeneratorController::class, 'budget']);
          Route::post('/ai/budget-chat', [AiBudgetChatController::class, 'chat']);
          Route::post('/ai/budget-chat/apply', [AiBudgetChatController::class, 'applyProposal']);

        // Budget categories CRUD
        Route::get('/budget-categories', [BudgetCategoryController::class, 'index']);
        Route::post('/budget-categories', [BudgetCategoryController::class, 'store']);
        Route::patch('/budget-categories/{category}', [BudgetCategoryController::class, 'update']);
        Route::delete('/budget-categories/{category}', [BudgetCategoryController::class, 'destroy']);

        // Budget items (shortlisted venues/vendors under a category)
        Route::post('/budget-items', [BudgetItemController::class, 'store']);
        Route::patch('/budget-items/{item}', [BudgetItemController::class, 'update']);
        Route::delete('/budget-items/{item}', [BudgetItemController::class, 'destroy']);

        // Checklist
        Route::get('/checklist', [ChecklistController::class, 'index']);
        Route::post('/checklist', [ChecklistController::class, 'store']);
        Route::patch('/checklist/{item}', [ChecklistController::class, 'update']);
        Route::delete('/checklist/{item}', [ChecklistController::class, 'destroy']);

        // Favorites
        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
    });

    // Vendor portal
    Route::middleware('role:vendor,admin')->prefix('vendor-portal')->group(function () {
        Route::get('/analytics', [VendorAnalyticsController::class, 'stats']);
        Route::patch('/profile', [VendorAnalyticsController::class, 'updateProfile']);
        Route::post('/upload-photo', [VendorAnalyticsController::class, 'uploadPhoto']);
        Route::post('/delete-photo', [VendorAnalyticsController::class, 'deletePhoto']);
        Route::post('/upload-brochure', [VendorAnalyticsController::class, 'uploadBrochure']);
        Route::post('/delete-brochure', [VendorAnalyticsController::class, 'deleteBrochure']);
        Route::post('/select-plan', [VendorAnalyticsController::class, 'selectPlan']);
        Route::get('/my-application', [VendorAnalyticsController::class, 'myApplication']);
        Route::post('/my-application', [VendorAnalyticsController::class, 'submitApplicationVerification']);
        Route::post('/claim-badge', [VendorAnalyticsController::class, 'claimBadge']);
        Route::post('/toggle-publish', [VendorAnalyticsController::class, 'togglePublish']);
        
        // Stripe Subscriptions
        Route::post('/create-checkout-session', [StripePaymentController::class, 'createCheckoutSession']);
    });

    // Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/revenue', [AdminRevenueController::class, 'revenue']);
        Route::get('/vendors', [\App\Http\Controllers\AdminVendorController::class, 'index']);

        Route::get('/vendor-applications', [VendorApplicationController::class, 'adminIndex']);
        Route::get('/vendor-applications/{application}', [VendorApplicationController::class, 'adminShow']);
        Route::post('/vendor-applications/{application}/approve', [VendorApplicationController::class, 'adminApprove']);
        Route::post('/vendor-applications/{application}/reject', [VendorApplicationController::class, 'adminReject']);
    });
});
Route::get('/dev/reset-database', function (\Illuminate\Http\Request $request) {
    if ($request->query('secret') !== 'GoldenPromiseFYP') {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        return response()->json(['message' => 'Database Reset Successful! GoldenPromise DB is clean and reseeded.']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/dev/test-email', function (\Illuminate\Http\Request $request) {
    if ($request->query('secret') !== 'GoldenPromiseFYP') {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    try {
        $config = [
            'mailer' => config('mail.default'),
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'username' => config('mail.mailers.smtp.username'),
            'encryption' => config('mail.mailers.smtp.encryption'),
            'from' => config('mail.from.address'),
        ];
        
        \Illuminate\Support\Facades\Mail::raw('Test email from live Render server diagnosing email issues.', function ($m) {
            $m->to('yaashu0508@gmail.com')->subject('Render Live Diagnostics Test');
        });
        
        return response()->json([
            'status' => 'success',
            'message' => 'Email sent successfully from the live server!',
            'mail_config' => $config
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'error_class' => get_class($e),
            'message' => $e->getMessage(),
            'mail_config' => $config ?? []
        ], 500);
    }
});

Route::get('/dev/show-logs', function (\Illuminate\Http\Request $request) {
    if ($request->query('secret') !== 'GoldenPromiseFYP') {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    try {
        $logPath = storage_path('logs/laravel.log');
        if (!file_exists($logPath)) {
            return response()->json(['message' => 'Log file does not exist yet.']);
        }
        $lines = array_slice(explode("\n", file_get_contents($logPath)), -100);
        return response()->json(['logs' => $lines]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/dev/env-urls', function () {
    return response()->json([
        'FRONTEND_URL' => env('FRONTEND_URL'),
        'ADMIN_URL' => env('ADMIN_URL'),
        'APP_URL' => env('APP_URL'),
    ]);
});

