<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VerifyVendorApplication implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $applicationId;

    public function __construct($applicationId)
    {
        $this->applicationId = $applicationId;
    }

    public function handle(): void
    {
        $application = VendorApplication::find($this->applicationId);
        
        if (!$application || $application->status !== 'pending') {
            return;
        }

        try {
            $ssmPath = $application->ssm_doc;
            $nricPath = $application->nric_or_passport_doc;
            
            $prompt = "You are a verification assistant. The user submitted a business application. 
Applicant Name: {$application->applicant_name}
Business Name: {$application->business_name}
Bank Account Holder: {$application->bank_account_holder}

Please review the attached documents (SSM, NRIC, Bank statement) and verify that the names on the documents match the submitted names exactly (or very closely).
Return a JSON object in the following format exactly, with no markdown formatting:
{
  \"is_approved\": true/false,
  \"reason\": \"If rejected, explain exactly which document failed and why.\"
}";

            $messages = [
                [
                    "role" => "user",
                    "content" => [
                        ["type" => "text", "text" => $prompt]
                    ]
                ]
            ];

            // Attach Documents if available (and if they are images)
            foreach ([$ssmPath, $nricPath] as $path) {
                if ($path && Storage::disk('public')->exists($path)) {
                    $ext = pathinfo($path, PATHINFO_EXTENSION);
                    $mime = in_array(strtolower($ext), ['jpg', 'jpeg']) ? 'image/jpeg' : (strtolower($ext) === 'png' ? 'image/png' : 'application/pdf');
                    
                    if (str_starts_with($mime, 'image/')) {
                        $base64 = base64_encode(Storage::disk('public')->get($path));
                        $messages[0]["content"][] = [
                            "type" => "image_url",
                            "image_url" => [
                                "url" => "data:{$mime};base64,{$base64}"
                            ]
                        ];
                    }
                }
            }

            $response = Http::withToken(env('GROQ_API_KEY'))
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.2-90b-vision-preview',
                    'messages' => $messages,
                    'temperature' => 0.1,
                    'max_tokens' => 300,
                    'response_format' => ['type' => 'json_object']
                ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                $result = json_decode($content, true);

                if (isset($result['is_approved']) && $result['is_approved'] === true) {
                    $this->approveApplication($application);
                } else {
                    $application->update([
                        'status' => 'rejected',
                        'ai_rejection_reason' => $result['reason'] ?? 'Document verification failed.'
                    ]);
                }
            } else {
                // If API fails, leave it pending for manual review
                $application->update([
                    'admin_notes' => 'AI Verification API failed: ' . $response->body()
                ]);
            }
        } catch (\Exception $e) {
            $application->update([
                'admin_notes' => 'AI Verification failed: ' . $e->getMessage()
            ]);
        }
    }

    private function approveApplication($application)
    {
        DB::transaction(function () use ($application) {
            $tempPassword = Str::random(10);
            
            $user = User::firstOrCreate(
                ['email' => $application->email],
                [
                    'name' => $application->applicant_name,
                    'password' => Hash::make($tempPassword),
                    'role' => 'vendor',
                ]
            );

            $slug = Str::slug($application->business_name . '-' . Str::random(4));
            $productLimit = match ($application->subscription_tier_requested) {
                'premium' => 10,
                'elite', 'golpro' => 25,
                default => 5,
            };
            
            $specs = $application->specialties ?? [];
            $mapLink = $specs['google_map_link'] ?? $application->website;

            $vendorData = [
                'user_id' => $user->id,
                'vendor_category_id' => $application->vendor_category_id,
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
                'is_approved' => true,
                'is_verified' => true,
                'is_golpro' => in_array($application->subscription_tier_requested, ['elite', 'golpro'], true),
                'subscription_tier' => $application->subscription_tier_requested,
                'product_limit' => $productLimit,
                'business_type' => 'verified',
            ];

            // Venue applications carry extra venue-only attributes in `specialties.is_venue`
            if (!empty($specs['is_venue'])) {
                $vendorData['venue_type'] = $specs['venue_type'] ?? 'Indoor / Outdoor';
                $vendorData['style'] = $specs['venue_style'] ?? 'Modern';
                $vendorData['description'] = $application->bio;
                $vendorData['capacity'] = $specs['capacity'] ?? '200 pax';
                $vendorData['is_all_inclusive'] = filter_var($specs['is_all_inclusive'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $vendorData['map_url'] = $mapLink;
                $vendorData['email'] = $application->email;
                $vendorData['whatsapp_phone'] = $application->phone;
                $vendorData['photos'] = $application->portfolio_urls ?? [];
            }

            $vendor = Vendor::create($vendorData);

            $application->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'admin_notes' => 'Auto-approved by AI Vision API',
                'created_user_id' => $user->id,
                'created_vendor_id' => $vendor->id,
            ]);
        });
    }
}
