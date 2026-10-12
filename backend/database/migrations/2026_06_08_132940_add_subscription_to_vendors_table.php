<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->enum('subscription_tier', ['free', 'premium', 'golpro'])->default('free')->after('is_approved');
            $table->date('subscription_expires_at')->nullable()->after('subscription_tier');
            $table->unsignedInteger('product_limit')->default(5)->after('subscription_expires_at')->comment('Free=5, Premium=20, GolPro=unlimited(9999)');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['subscription_tier', 'subscription_expires_at', 'product_limit']);
        });
    }
};
