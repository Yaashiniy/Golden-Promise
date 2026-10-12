<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('culture', 30)->nullable()->after('wedding_date')
                ->comment('Malay, Chinese, Indian, Christian, Sikh, Civil, Other');
            $table->string('wedding_location')->nullable()->after('culture');
            $table->boolean('onboarded')->default(false)->after('wedding_location');
        });

        Schema::table('checklist_items', function (Blueprint $table) {
            $table->string('section', 80)->nullable()->after('title')
                ->comment('Logical grouping e.g. Pre-Wedding, Akad Nikah, Reception');
            $table->boolean('is_ai_generated')->default(false)->after('section');
            $table->index('section');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['culture', 'wedding_location', 'onboarded']);
        });
        Schema::table('checklist_items', function (Blueprint $table) {
            $table->dropIndex(['section']);
            $table->dropColumn(['section', 'is_ai_generated']);
        });
    }
};
