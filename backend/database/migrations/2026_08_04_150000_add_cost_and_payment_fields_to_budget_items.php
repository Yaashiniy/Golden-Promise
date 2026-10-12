<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budget_items', function (Blueprint $table) {
            $table->unsignedInteger('actual_cost')->default(0)->after('estimated');
            $table->unsignedInteger('paid_amount')->default(0)->after('actual_cost');
            $table->boolean('paid')->default(false)->after('paid_amount');
            $table->date('payment_due_date')->nullable()->after('paid');
        });
    }

    public function down(): void
    {
        Schema::table('budget_items', function (Blueprint $table) {
            $table->dropColumn(['actual_cost', 'paid_amount', 'paid', 'payment_due_date']);
        });
    }
};
