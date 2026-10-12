<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->json('languages')->nullable()->after('experiences');
            $table->json('specialties')->nullable()->after('languages');
            $table->unsignedSmallInteger('response_time_hours')->default(24)->after('specialties');
            $table->unsignedTinyInteger('response_rate_percent')->default(95)->after('response_time_hours');
            $table->unsignedSmallInteger('years_experience')->nullable()->after('response_rate_percent');
            $table->boolean('is_verified')->default(false)->after('is_approved');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['languages', 'specialties', 'response_time_hours', 'response_rate_percent', 'years_experience', 'is_verified']);
        });
    }
};
