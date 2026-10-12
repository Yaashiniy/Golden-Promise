<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'vendor', 'couple'])->default('couple')->after('email');
            $table->string('partner_name')->nullable()->after('role');
            $table->date('wedding_date')->nullable()->after('partner_name');
            $table->string('photo_path')->nullable()->after('wedding_date');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn(['role', 'partner_name', 'wedding_date', 'photo_path']);
        });
    }
};
