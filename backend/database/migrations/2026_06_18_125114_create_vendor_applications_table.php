<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_applications', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();

            // Applicant
            $table->string('applicant_name');
            $table->string('email');
            $table->string('phone');

            // Business
            $table->string('business_name');
            $table->string('business_address');
            $table->string('city');
            $table->string('state');
            $table->string('postcode', 20)->nullable();
            $table->foreignId('vendor_category_id')->constrained()->cascadeOnDelete();

            // Legal documents
            $table->string('ssm_number')->comment('SSM company registration number');
            $table->string('ssm_doc_path')->nullable()->comment('Uploaded SSM certificate');
            $table->string('business_license_doc_path')->nullable()->comment('Uploaded business license');
            $table->string('nric_or_passport_doc_path')->nullable()->comment('Owner ID');

            // Banking (for payouts after approval)
            $table->string('bank_name', 80);
            $table->string('bank_account_number', 50);
            $table->string('bank_account_holder');

            // Profile fields (will become vendor profile on approval)
            $table->text('bio');
            $table->json('specialties')->nullable();
            $table->json('languages')->nullable();
            $table->json('religion_focus')->nullable();
            $table->unsignedInteger('price_from')->default(0);
            $table->unsignedSmallInteger('years_experience')->default(0);
            $table->string('instagram')->nullable();
            $table->string('website')->nullable();
            $table->json('portfolio_urls')->nullable()->comment('Sample work links');

            // Subscription chosen
            $table->enum('subscription_tier_requested', ['free', 'premium', 'golpro'])->default('free');
            $table->string('payment_proof_path')->nullable()->comment('Proof of subscription payment');

            // Review workflow
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('admin_notes')->nullable();

            // Result links
            $table->foreignId('created_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_vendor_id')->nullable()->constrained('vendors')->nullOnDelete();

            $table->timestamps();
            $table->index('status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_applications');
    }
};
