<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('vendors')
            ->where('subscription_tier', 'premium')
            ->update(['is_golpro' => false]);

        DB::table('vendors')
            ->where('subscription_tier', 'golpro')
            ->update(['is_golpro' => true]);
    }

    public function down(): void
    {
        DB::table('vendors')
            ->where('subscription_tier', 'premium')
            ->update(['is_golpro' => true]);
    }
};
