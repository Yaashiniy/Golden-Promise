<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vendor_category_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('area');
            $table->string('address')->nullable();
            $table->text('bio')->nullable();
            $table->text('experiences')->nullable();
            $table->unsignedInteger('price_from')->default(0);
            $table->decimal('rating', 3, 1)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->string('instagram')->nullable();
            $table->boolean('is_golpro')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->json('photos')->nullable();
            
            // Venue specific columns
            $table->string('venue_type')->nullable();
            $table->string('style')->nullable();
            $table->string('capacity')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('map_url')->nullable();
            $table->boolean('is_all_inclusive')->default(false);
            $table->json('also_for')->nullable();
            $table->text('description')->nullable();

            $table->timestamps();

            $table->index('area');
            $table->index('is_golpro');
            $table->index('is_approved');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
