<?php

namespace App\Console\Commands;

use App\Models\Vendor;
use App\Mail\SubscriptionExpired;
use App\Mail\SubscriptionExpiringSoon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class CheckSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for expired and expiring vendor subscriptions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Process Expired Subscriptions
        $expiredVendors = Vendor::with('user')
            ->where('subscription_tier', '!=', 'free')
            ->whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '<', now())
            ->get();

        foreach ($expiredVendors as $vendor) {
            $oldTier = $vendor->subscription_tier;
            $vendor->subscription_tier = 'free';
            $vendor->is_golpro = false;
            $vendor->is_verified = false;
            $vendor->product_limit = 5; // Downgrade limits
            $vendor->save();

            if ($vendor->user && $vendor->user->email) {
                Mail::to($vendor->user->email)->send(new SubscriptionExpired($vendor, $oldTier));
            }
            
            $this->info("Downgraded vendor {$vendor->id} ({$vendor->name}) to free tier.");
        }

        // 2. Process Expiring Soon (Exactly 3 days away)
        // Check if the expiration is between 72 and 73 hours from now to only send once per day if running daily
        $expiringVendors = Vendor::with('user')
            ->where('subscription_tier', '!=', 'free')
            ->whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '>', now()->addDays(3))
            ->where('subscription_expires_at', '<', now()->addDays(3)->addHours(24))
            ->get();

        foreach ($expiringVendors as $vendor) {
            if ($vendor->user && $vendor->user->email) {
                Mail::to($vendor->user->email)->send(new SubscriptionExpiringSoon($vendor));
            }
            $this->info("Sent expiration reminder to vendor {$vendor->id} ({$vendor->name}).");
        }
        
        $this->info("Subscription check completed.");
    }
}
