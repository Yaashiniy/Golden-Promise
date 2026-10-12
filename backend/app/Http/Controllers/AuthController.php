<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewVendorRegisteredMail;

class AuthController extends Controller
{
    public function registerVendor(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'whatsapp_phone' => ['required', 'string', 'max:30'],
            'business_name' => ['required', 'string', 'max:255'],
            'vendor_category_id' => ['nullable', 'required_without:custom_category', 'exists:vendor_categories,id'],
            'subscription_tier' => ['required', 'in:free,premium,elite'],
            'custom_category' => ['nullable', 'required_without:vendor_category_id', 'string', 'max:100'],
        ]);

        $categoryId = $data['vendor_category_id'] ?? VendorCategory::firstOrCreate(
            ['slug' => 'others'],
            ['name' => 'Others']
        )->id;

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'vendor',
        ]);

        $slug = Str::slug($data['business_name'] . '-' . Str::random(4));

        // Start as free plan by default; upgraded instantly on Stripe checkout success
        $vendor = Vendor::create([
            'user_id' => $user->id,
            'vendor_category_id' => $categoryId,
            'slug' => $slug,
            'name' => $data['business_name'],
            'whatsapp_phone' => preg_replace('/\D/', '', $data['whatsapp_phone']),
            'subscription_tier' => 'free',
            'product_limit' => 5,
            'is_approved' => false,
            'is_verified' => false,
            'is_golpro' => false,
            'area' => 'Kuala Lumpur',
            'state' => 'Kuala Lumpur',
            'address' => 'Pending Setup',
            'custom_category' => $data['custom_category'] ?? null,
        ]);

        // Send notification email to admin
        try {
            Mail::to('yaashu0508@gmail.com')->send(new NewVendorRegisteredMail($vendor, $data['subscription_tier']));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send vendor registration email: ' . $e->getMessage());
        }

        $checkoutUrl = null;
        if (in_array($data['subscription_tier'], ['premium', 'elite'])) {
            try {
                \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
                $tier = $data['subscription_tier'];
                $price = $tier === 'elite' ? 39900 : 29900;

                $session = \Stripe\Checkout\Session::create([
                    'payment_method_types' => ['card'],
                    'customer_email' => $user->email,
                    'line_items' => [[
                        'price_data' => [
                            'currency' => 'myr',
                            'product_data' => [
                                'name' => 'Golden Promise ' . ucfirst($tier) . ' Plan',
                                'description' => 'Monthly subscription for vendor directory.',
                            ],
                            'unit_amount' => $price,
                        ],
                        'quantity' => 1,
                    ]],
                    'mode' => 'payment',
                    'success_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/vendor-portal/payment-success?session_id={CHECKOUT_SESSION_ID}&flow=signup',
                    'cancel_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/vendor-portal/subscription',
                    'client_reference_id' => $user->id,
                    'metadata' => [
                        'tier' => $tier,
                        'vendor_id' => $vendor->id
                    ]
                ]);
                $checkoutUrl = $session->url;
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Stripe session failed on registration: ' . $e->getMessage());
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('vendor'),
            'token' => $token,
            'checkout_url' => $checkoutUrl,
        ], 201);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => ['required', 'in:couple'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($data, true)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->isVendor()) {
            $user->load('vendor');
        } else {
            $user->load('budget');
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->tokens()?->delete();
        Auth::guard('web')->logout();
        return response()->json(['ok' => true]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        if ($user->isVendor()) {
            $user->load('vendor');
        } else {
            $user->load('budget');
        }
        return response()->json($user);
    }
}
