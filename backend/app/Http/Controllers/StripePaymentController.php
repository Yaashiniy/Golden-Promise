<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;

class StripePaymentController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'tier' => 'required|in:premium,elite'
        ]);

        $user = Auth::user();
        if (!$user || !$user->vendor) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Set Stripe secret key from config
        Stripe::setApiKey(config('services.stripe.secret'));

        $tier = $request->tier;
        $price = $tier === 'elite' ? 39900 : 29900;

        try {
            $session = Session::create([
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
                // Important: Frontend success page
                'success_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/vendor-portal/payment-success?session_id={CHECKOUT_SESSION_ID}&flow=upgrade',
                'cancel_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/vendor-portal/subscription',
                'client_reference_id' => $user->id,
                'metadata' => [
                    'tier' => $tier,
                    'vendor_id' => $user->vendor->id
                ]
            ]);

            return response()->json(['url' => $session->url]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create checkout session: ' . $e->getMessage()], 500);
        }
    }

    public function checkoutSuccess(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string'
        ]);
        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $session = Session::retrieve($request->session_id);
            \Illuminate\Support\Facades\Log::info('Stripe Session retrieved: ' . $session->id . ' status: ' . $session->payment_status);

            if ($session->payment_status === 'paid') {
                $vendorId = $session->metadata->vendor_id;
                $tier = $session->metadata->tier;

                \Illuminate\Support\Facades\Log::info('Upgrading vendor ID: ' . $vendorId . ' to tier: ' . $tier);
                
                $vendor = Vendor::find($vendorId);

                if ($vendor) {
                    $vendor->subscription_tier = $tier;
                    $vendor->subscription_expires_at = now()->addDays(30);
                    
                    if ($tier === 'elite') {
                        $vendor->is_golpro = true;
                        $vendor->is_verified = true;
                        $vendor->product_limit = 25;
                    } elseif ($tier === 'premium') {
                        $vendor->is_golpro = false;
                        $vendor->is_verified = false;
                        $vendor->product_limit = 10;
                    }
                    
                    $vendor->save();
                    \Illuminate\Support\Facades\Log::info('Vendor saved successfully. New tier: ' . $vendor->subscription_tier);

                    return response()->json(['message' => 'Subscription upgraded successfully', 'tier' => $tier]);
                }

                \Illuminate\Support\Facades\Log::warning('Vendor not found for ID: ' . $vendorId);
            } else {
                \Illuminate\Support\Facades\Log::warning('Payment status is not paid: ' . $session->payment_status);
            }

            return response()->json(['message' => 'Payment not completed'], 400);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Stripe exception: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to retrieve session: ' . $e->getMessage()], 500);
        }
    }
}
