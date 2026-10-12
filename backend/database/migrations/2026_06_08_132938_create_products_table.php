<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('sku')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['service', 'product'])->default('service');
            $table->unsignedInteger('price');
            $table->unsignedInteger('special_price')->nullable();
            $table->date('special_price_from')->nullable();
            $table->date('special_price_to')->nullable();
            $table->unsignedInteger('quantity')->default(0)->comment('0 = unlimited for services');
            $table->boolean('track_quantity')->default(false)->comment('true = decrement stock on purchase');
            $table->enum('status', ['draft', 'active', 'inactive'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->string('duration')->nullable()->comment('e.g. 2 hours, Full day, Per event');
            $table->string('coverage_area')->nullable()->comment('e.g. Johor Bahru, Whole Malaysia');
            $table->json('whats_included')->nullable()->comment('Array of strings');
            $table->json('tags')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['vendor_id', 'status']);
            $table->index(['vendor_category_id', 'status']);
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
