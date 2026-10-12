<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot from marketplace model to classifieds/directory model (PropertyGuru-style):
 *  - No transactions between couples and vendors
 *  - Vendors advertise via subscription
 *  - Contact is via WhatsApp
 */
return new class extends Migration
{
    public function up(): void
    {
        // Drop transaction/marketplace tables with CASCADE (Postgres) to handle FKs
        $driver = Schema::getConnection()->getDriverName();
        $cascade = $driver === 'pgsql' ? ' CASCADE' : '';
        foreach (['transactions', 'booking_items', 'messages', 'conversations', 'bookings', 'cart_items', 'product_images', 'products'] as $t) {
            Schema::getConnection()->statement("DROP TABLE IF EXISTS {$t}{$cascade}");
        }

        // Add advertising/analytics columns to vendors
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'whatsapp_phone')) {
                $table->string('whatsapp_phone', 30)->nullable()->after('instagram')
                    ->comment('Malaysian format e.g. 60123456789 (no + or spaces)');
            }
            if (!Schema::hasColumn('vendors', 'email')) {
                $table->string('email')->nullable()->after('whatsapp_phone');
            }
            if (!Schema::hasColumn('vendors', 'website')) {
                $table->string('website')->nullable()->after('email');
            }
            if (!Schema::hasColumn('vendors', 'view_count')) {
                $table->unsignedInteger('view_count')->default(0);
            }
            if (!Schema::hasColumn('vendors', 'whatsapp_click_count')) {
                $table->unsignedInteger('whatsapp_click_count')->default(0);
            }
            if (!Schema::hasColumn('vendors', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->comment('Boosted / paid placement');
            }
        });

        // Budget items no longer FK to products (only venues/vendors/custom now)
        // Keep the budget_items table itself — couples still shortlist.
    }

    public function down(): void
    {
        // No down — this is a one-way pivot.
    }
};
