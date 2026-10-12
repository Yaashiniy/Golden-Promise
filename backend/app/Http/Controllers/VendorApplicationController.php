<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Jobs\VerifyVendorApplication;

class VendorApplicationController extends Controller
{
    /** Public: submit a vendor application. */
    public function store(Request $request)
    {
        // Auto-resolve "others" category
        if ($request->input('vendor_category_id') === 'others') {
            $othersCat = \App\Models\VendorCategory::firstOrCreate(
                ['slug' => 'others'],
                [
                    'name' => 'Others', 
                    'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
                    'position' => 99
                ]
            );
            $request->merge(['vendor_category_id' => $othersCat->id]);
        }

        $isFreelancer = filter_var($request->input('is_freelancer'), FILTER_VALIDATE_BOOLEAN);

        $data = $request->validate([
            'applicant_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'string', 'max:30'],

            'business_name' => ['required', 'string', 'max:200'],
            'business_address' => ['required', 'string', 'max:300'],
            'city' => ['required', 'string', 'max:80'],
            'state' => ['required', 'string', 'max:60'],
            'postcode' => ['nullable', 'string', 'max:20'],
            'vendor_category_id' => ['required', 'exists:vendor_categories,id'],
            'custom_category' => ['nullable', 'string', 'max:80'],
            'is_freelancer' => ['nullable', 'string', 'in:true,false,1,0'],

            'capacity' => ['nullable', 'string', 'max:80'],
            'venue_type' => ['nullable', 'string', 'max:80'],
            'venue_style' => ['nullable', 'string', 'max:80'],
            'is_all_inclusive' => ['nullable', 'string', 'in:true,false,1,0'],
            'google_map_link' => ['nullable', 'string', 'max:500'],

            'ssm_number' => $isFreelancer ? ['nullable', 'string', 'max:60'] : ['required', 'string', 'max:60'],
            'ssm_doc' => $isFreelancer ? ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'] : ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'business_license_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'nric_or_passport_doc' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],

            'bank_name' => ['required', 'string', 'max:80'],
            'bank_account_number' => ['required', 'string', 'max:50'],
            'bank_account_holder' => ['required', 'string', 'max:120'],

            'bio' => ['required', 'string', 'min:50', 'max:5000'],
            'specialties' => ['nullable', 'array'],
            'specialties.*' => ['string', 'max:80'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:60'],
            'religion_focus' => ['nullable', 'array'],
            'religion_focus.*' => ['string', 'max:60'],
            'price_from' => ['required', 'integer', 'min:0'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:80'],
            'instagram' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'url', 'max:255'],
            'portfolio_urls' => ['nullable', 'array', 'max:10'],
            'portfolio_urls.*' => ['url'],

            'subscription_tier_requested' => ['required', 'in:free,premium,golpro'],
            'payment_proof' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        // 1. Check if email domain is valid (has active MX or A records)
        $domain = substr(strrchr($data['email'], "@"), 1);
        if (!checkdnsrr($domain, "MX") && !checkdnsrr($domain, "A")) {
            return response()->json(['message' => 'Please check your email address (invalid address).'], 422);
        }

        // 2. Check if user account already exists with couple or admin roles
        $nonVendorUser = \App\Models\User::where('email', $data['email'])->whereIn('role', ['couple', 'admin'])->exists();
        if ($nonVendorUser) {
            return response()->json(['message' => 'This email has already been registered.'], 422);
        }

        // 3. Check if there is already a pending or approved application with this email AND business name
        $duplicateApp = \App\Models\VendorApplication::where('email', $data['email'])
            ->where('business_name', $data['business_name'])
            ->whereIn('status', ['pending', 'approved'])
            ->exists();
        if ($duplicateApp) {
            return response()->json(['message' => 'This email has already been registered.'], 422);
        }

        // GolPro & premium require payment proof
        if (in_array($data['subscription_tier_requested'], ['premium', 'golpro']) && !$request->hasFile('payment_proof')) {
            return response()->json(['message' => 'Payment proof is required for Premium and GolPro tiers.'], 422);
        }

        $folder = 'applications/' . now()->format('Y-m');
        if ($request->hasFile('ssm_doc')) {
            $data['ssm_doc_path'] = $request->file('ssm_doc')->store($folder, 'public');
        }
        if ($request->hasFile('business_license_doc')) {
            $data['business_license_doc_path'] = $request->file('business_license_doc')->store($folder, 'public');
        }
        $data['nric_or_passport_doc_path'] = $request->file('nric_or_passport_doc')->store($folder, 'public');
        if ($request->hasFile('payment_proof')) {
            $data['payment_proof_path'] = $request->file('payment_proof')->store($folder, 'public');
        }

        if ($isFreelancer) {
            $data['ssm_number'] = 'FREELANCER';
        }

        $notes = [];
        if (!empty($data['custom_category'])) {
            $notes[] = "Custom requested category: " . $data['custom_category'];
        }
        if ($isFreelancer) {
            $notes[] = "Applicant registered as Freelancer / Startup without SSM.";
        }
        if (!empty($notes)) {
            $data['admin_notes'] = implode("\n", $notes);
        }
        $isVenue = false;
        if ($request->input('vendor_category_id')) {
            $catId = $request->input('vendor_category_id');
            $dbCat = \App\Models\VendorCategory::find($catId);
            if ($dbCat && ($dbCat->slug === 'venue' || strtolower($dbCat->name) === 'venue')) {
                $isVenue = true;
            }
        }

        if ($isVenue) {
            $lat = null;
            $lng = null;
            $mapLink = $request->input('google_map_link') ?? '';
            if (!empty($mapLink)) {
                // 1. Try matching @lat,lng
                if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $mapLink, $matches)) {
                    $lat = floatval($matches[1]);
                    $lng = floatval($matches[2]);
                }
                // 2. Try matching q=lat,lng or ll=lat,lng
                elseif (preg_match('/[?&](q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/', $mapLink, $matches)) {
                    $lat = floatval($matches[2]);
                    $lng = floatval($matches[3]);
                }
            }

            $data['specialties'] = [
                'is_venue' => true,
                'capacity' => $request->input('capacity'),
                'venue_type' => $request->input('venue_type'),
                'venue_style' => $request->input('venue_style'),
                'is_all_inclusive' => filter_var($request->input('is_all_inclusive'), FILTER_VALIDATE_BOOLEAN),
                'google_map_link' => $mapLink,
                'latitude' => $lat,
                'longitude' => $lng,
            ];
        }

        unset($data['custom_category'], $data['is_freelancer'], $data['capacity'], $data['venue_type'], $data['venue_style'], $data['is_all_inclusive'], $data['google_map_link']);

        unset($data['ssm_doc'], $data['business_license_doc'], $data['nric_or_passport_doc'], $data['payment_proof']);

        $data['reference'] = 'APP-' . strtoupper(Str::random(8));
        $data['status'] = 'pending';

        $app = VendorApplication::create($data);

        // Dispatch AI Verification Job
        VerifyVendorApplication::dispatch($app->id);

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "New vendor application received from {$app->applicant_name} ({$app->business_name}).\nReference: {$app->reference}",
                function ($m) use ($app) {
                    $m->to('yaashu0508@gmail.com')
                      ->subject("New Vendor Application: {$app->business_name}");
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send vendor application email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Application submitted! Our team will review within 3-5 business days.',
            'reference' => $app->reference,
        ], 201);
    }

    /** Public: anyone can check status by email + reference. */
    public function status(Request $request)
    {
        $data = $request->validate([
            'reference' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);
        $app = VendorApplication::where('reference', $data['reference'])
            ->where('email', $data['email'])
            ->first();
        if (!$app) return response()->json(['message' => 'No application found.'], 404);

        return response()->json([
            'reference' => $app->reference,
            'status' => $app->status,
            'business_name' => $app->business_name,
            'submitted_at' => $app->created_at,
            'reviewed_at' => $app->reviewed_at,
            'rejection_reason' => $app->rejection_reason,
        ]);
    }

    // ─── Admin ───

    public function adminIndex(Request $request)
    {
        $query = VendorApplication::with('category:id,name,slug')->latest();
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        return $query->paginate(20);
    }

    public function adminShow(VendorApplication $application)
    {
        return $application->load(['category', 'reviewer:id,name', 'vendor:id,slug,name', 'user:id,email,name']);
    }

    public function adminApprove(Request $request, VendorApplication $application)
    {
        abort_if($application->status === 'approved', 422, 'Already approved');

        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:30'],
            'business_type' => ['sometimes', 'string', 'in:ssm,startup,homemade'],
        ]);

        $tempPassword = Str::random(10);
        $admin = $request->user();
        $businessType = $data['business_type'] ?? 'ssm';

        if ($application->created_vendor_id) {
            DB::transaction(function () use ($application, $data, $admin, $businessType) {
                $vendor = Vendor::findOrFail($application->created_vendor_id);
                $categoryId = $this->resolveApprovedCategoryId($application, $vendor);
                $vendor->update([
                    'business_type' => $businessType,
                    'vendor_category_id' => $categoryId,
                ]);

                $application->update([
                    'vendor_category_id' => $categoryId,
                    'status' => 'approved',
                    'reviewed_by_user_id' => $admin->id,
                    'reviewed_at' => now(),
                    'admin_notes' => $data['admin_notes'] ?? null,
                ]);
            });

            return response()->json([
                'message' => 'SSM status verified & business type approved.',
                'application' => $application->fresh()->load(['vendor', 'user']),
            ]);
        }

        DB::transaction(function () use ($application, $data, $tempPassword, $admin, $businessType) {
            // 1. Create the user account
            $user = User::firstOrCreate(
                ['email' => $application->email],
                [
                    'name' => $application->applicant_name,
                    'password' => Hash::make($tempPassword),
                    'role' => 'vendor',
                ],
            );

            // 2. Create the vendor profile (slug auto-generated)
            $slug = Str::slug($application->business_name . '-' . Str::random(4));
            $productLimit = match ($application->subscription_tier_requested) {
                'premium' => 10,
                'golpro' => 25,
                default => 5,
            };
            $specs = $application->specialties ?? [];
            $mapLink = $specs['google_map_link'] ?? $application->website;
            $categoryId = $this->resolveApprovedCategoryId($application);

            $vendorData = [
                'user_id' => $user->id,
                'vendor_category_id' => $categoryId,
                'slug' => $slug,
                'name' => $application->business_name,
                'area' => $application->city,
                'state' => $application->state,
                'address' => $application->business_address,
                'bio' => $application->bio,
                'price_from' => $application->price_from,
                'years_experience' => $application->years_experience,
                'instagram' => $application->instagram,
                'website' => $mapLink,
                'specialties' => $application->specialties,
                'languages' => $application->languages,
                'religion_focus' => $application->religion_focus,
                'is_approved' => false,
                'is_verified' => false,
                'is_golpro' => $application->subscription_tier_requested === 'golpro',
                'subscription_tier' => $application->subscription_tier_requested,
                'product_limit' => $productLimit,
                'commission_rate' => $data['commission_rate'] ?? null,
                'business_type' => $businessType,
            ];

            // Venue applications carry extra venue-only attributes in `specialties.is_venue`
            if (!empty($specs['is_venue'])) {
                $vendorData['venue_type'] = $specs['venue_type'] ?? 'Indoor / Outdoor';
                $vendorData['style'] = $specs['venue_style'] ?? 'Modern';
                $vendorData['description'] = $application->bio;
                $vendorData['capacity'] = $specs['capacity'] ?? '200 pax';
                $vendorData['is_all_inclusive'] = filter_var($specs['is_all_inclusive'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $vendorData['latitude'] = isset($specs['latitude']) ? floatval($specs['latitude']) : null;
                $vendorData['longitude'] = isset($specs['longitude']) ? floatval($specs['longitude']) : null;
                $vendorData['map_url'] = $mapLink;
                $vendorData['email'] = $application->email;
                $vendorData['whatsapp_phone'] = $application->phone;
                $vendorData['photos'] = $application->portfolio_urls ?? [];
            }

            $vendor = Vendor::create($vendorData);

            $application->update([
                'vendor_category_id' => $categoryId,
                'status' => 'approved',
                'reviewed_by_user_id' => $admin->id,
                'reviewed_at' => now(),
                'admin_notes' => $data['admin_notes'] ?? null,
                'created_user_id' => $user->id,
                'created_vendor_id' => $vendor->id,
            ]);
        });

        return response()->json([
            'message' => 'Approved. Vendor account created.',
            'temp_password' => $tempPassword,
            'login_email' => $application->email,
            'application' => $application->fresh()->load(['vendor', 'user']),
        ]);
    }

    private function resolveApprovedCategoryId(VendorApplication $application, ?Vendor $vendor = null): int
    {
        $customName = trim((string) $vendor?->custom_category);

        if ($customName === '' && preg_match('/^Custom requested category:\s*(.+)$/mi', (string) $application->admin_notes, $match)) {
            $customName = trim($match[1]);
        }

        if ($customName === '') {
            return $application->vendor_category_id;
        }

        $customName = preg_replace('/\s+/', ' ', mb_substr($customName, 0, 100));
        $slug = Str::slug($customName);
        if ($slug === '') {
            $slug = 'category-' . substr(sha1($customName), 0, 10);
        }

        return \App\Models\VendorCategory::firstOrCreate(
            ['slug' => $slug],
            [
                'name' => $customName,
                'position' => ((int) \App\Models\VendorCategory::max('position')) + 1,
            ],
        )->id;
    }

    public function adminReject(Request $request, VendorApplication $application)
    {
        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:10', 'max:1000'],
        ]);
        $application->update([
            'status' => 'rejected',
            'rejection_reason' => $data['rejection_reason'],
            'reviewed_by_user_id' => $request->user()->id,
            'reviewed_at' => now(),
        ]);
        return response()->json(['message' => 'Application rejected.', 'application' => $application]);
    }

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'business_name' => ['nullable', 'string', 'max:200'],
        ]);

        $email = $request->input('email');
        $businessName = $request->input('business_name');

        // 1. Check if email domain is valid (has active MX or A records)
        $domain = substr(strrchr($email, "@"), 1);
        if (!checkdnsrr($domain, "MX") && !checkdnsrr($domain, "A")) {
            return response()->json([
                'valid' => false,
                'reason' => 'domain',
                'message' => 'Please check your email address (invalid address).',
            ], 422);
        }

        // 2. Check if user account already exists with couple or admin roles
        $nonVendorUser = \App\Models\User::where('email', $email)->whereIn('role', ['couple', 'admin'])->exists();
        if ($nonVendorUser) {
            return response()->json([
                'valid' => false,
                'reason' => 'taken',
                'message' => 'This email has already been registered.',
            ], 422);
        }

        // 3. Check if there is already a pending or approved application with this email AND business name
        if ($businessName) {
            $duplicateApp = \App\Models\VendorApplication::where('email', $email)
                ->where('business_name', $businessName)
                ->whereIn('status', ['pending', 'approved'])
                ->exists();
            if ($duplicateApp) {
                return response()->json([
                    'valid' => false,
                    'reason' => 'taken',
                    'message' => 'This email has already been registered.',
                ], 422);
            }
        }

        return response()->json([
            'valid' => true,
            'message' => 'Email is valid and available.',
        ]);
    }

    public function resubmit(Request $request, VendorApplication $application)
    {
        if ($application->status !== 'rejected') {
            return response()->json(['message' => 'Only rejected applications can be resubmitted.'], 403);
        }

        $isFreelancer = filter_var($application->is_freelancer, FILTER_VALIDATE_BOOLEAN);

        $request->validate([
            'ssm_doc' => $isFreelancer ? ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'] : ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'nric_or_passport_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'bank_statement_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // Assuming they upload this in a new field if we add one, but wait, the original didn't have bank_statement_doc
        ]);

        $updates = ['status' => 'pending', 'ai_rejection_reason' => null];

        if ($request->hasFile('ssm_doc')) {
            if ($application->ssm_doc) Storage::disk('public')->delete($application->ssm_doc);
            $updates['ssm_doc'] = $request->file('ssm_doc')->store('vendor_applications', 'public');
        }
        if ($request->hasFile('nric_or_passport_doc')) {
            if ($application->nric_or_passport_doc) Storage::disk('public')->delete($application->nric_or_passport_doc);
            $updates['nric_or_passport_doc'] = $request->file('nric_or_passport_doc')->store('vendor_applications', 'public');
        }

        $application->update($updates);

        VerifyVendorApplication::dispatch($application->id);

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Vendor application RESUBMITTED from {$application->applicant_name} ({$application->business_name}).\nReference: {$application->reference}",
                function ($m) use ($application) {
                    $m->to('yaashu0508@gmail.com')
                      ->subject("Vendor Application Updated: {$application->business_name}");
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send vendor application resubmit email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Application resubmitted successfully for AI verification.',
            'application' => $application->fresh()
        ]);
    }
}
