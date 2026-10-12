<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('gateway');
            $table->string('gateway_ref')->nullable();
            $table->unsignedInteger('amount');
            $table->enum('type', ['payment', 'refund', 'payout'])->default('payment');
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->json('payload')->nullable();
            $table->timestamps();
            $table->index(['booking_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
