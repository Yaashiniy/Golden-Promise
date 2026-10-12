<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('guest_count')->nullable()->after('culture');
            $table->boolean('checklist_auto_generated')->default(false)->after('guest_count');
        });

        Schema::table('checklist_items', function (Blueprint $table) {
            $table->date('due_date')->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['guest_count', 'checklist_auto_generated']);
        });

        Schema::table('checklist_items', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });
    }
};
