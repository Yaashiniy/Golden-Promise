<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Widen culture column from varchar(30) to varchar(100)
            // to support free-form entries like "Minangkabau", "Tamil + Telugu", "Chindian"
            $table->string('culture', 100)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('culture', 30)->nullable()->change();
        });
    }
};
