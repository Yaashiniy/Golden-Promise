<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('budget_category_id')->constrained()->cascadeOnDelete();
            $table->string('name', 200);
            $table->string('source_type', 20)->nullable()->comment('venue|vendor|product|custom');
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('source_slug', 200)->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('estimated')->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_shortlisted')->default(false)->comment('Couple has shortlisted this as their pick');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->index(['user_id', 'budget_category_id']);
            $table->index(['source_type', 'source_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_items');
    }
};
