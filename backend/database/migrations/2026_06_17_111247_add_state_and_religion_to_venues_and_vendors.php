<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('state', 50)->nullable()->after('area');
            $table->json('religion_focus')->nullable()->after('specialties');
            $table->index('state');
        });
    }

    public function down(): void
    {

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropIndex(['state']);
            $table->dropColumn(['state', 'religion_focus']);
        });
    }
};
