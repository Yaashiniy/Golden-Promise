<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('icon', 40)->nullable()->comment('lucide icon name');
            $table->string('color', 7)->default('#8b5340')->comment('hex tile color');
            $table->unsignedInteger('estimated')->default(0);
            $table->unsignedInteger('avg_min')->default(0);
            $table->unsignedInteger('avg_max')->default(0);
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_ai_generated')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'position']);
        });

        Schema::table('budget_expenses', function (Blueprint $table) {
            $table->foreignId('budget_category_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('budget_expenses', function (Blueprint $table) {
            $table->dropForeign(['budget_category_id']);
            $table->dropColumn('budget_category_id');
        });
        Schema::dropIfExists('budget_categories');
    }
};
