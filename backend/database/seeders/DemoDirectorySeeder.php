<?php

namespace Database\Seeders;

use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Database\Seeder;

class DemoDirectorySeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = VendorCategory::pluck('id', 'slug');
        $venueId = $categoryIds['venues'] ?? null;
        if (!$venueId) return;

        $venuePhoto = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
        $templePhoto = 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80';
        $mosquePhoto = 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80';
        $churchPhoto = 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80';
        $catererPhoto = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80';
        $photoVideoPhoto = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';
        $floristPhoto = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80';
        $makeupPhoto = 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80';

        $venues = [
            // Core test venues
            ['slug' => 'test-venue-elite', 'name' => 'Diva Glass House Kempas', 'area' => 'Johor Bahru', 'state' => 'Johor', 'address' => '9, Jalan Kempas Utama 3/11, Taman Kempas Utama, 81200 Johor Bahru, Johor Darul Ta\'zim', 'style' => 'Glass House', 'price_from' => 8000, 'capacity' => '500 pax', 'religion_focus' => [], 'languages' => [], 'specialties' => [], 'photos' => ['/venue-profiles/diva_glass_house_287.png', '/venue-profiles/diva_glass_house_310.jpg', '/venue-profiles/diva_glass_house_302.jpg', '/venue-profiles/diva_glass_house_260.jpg', '/venue-profiles/diva_glass_house_254.jpg', '/venue-profiles/diva_glass_house_more_1.jpg', '/venue-profiles/diva_glass_house_more_2.jpg', '/venue-profiles/diva_glass_house_more_3.jpg'], 'subscription_tier' => 'golpro', 'is_golpro' => true, 'rating' => 5.0, 'facebook' => 'Galaxy-Glasshouse-By-Diva-61560389546604', 'tiktok' => 'galaxyglasshousebydiva', 'instagram' => 'galaxy.glasshousebydiva', 'brochure_path' => 'demo_brochure.pdf'],
            ['slug' => 'test-venue-premium', 'name' => 'Amari Johor Bahru', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Hotel Ballroom', 'price_from' => 6500, 'capacity' => '300 pax', 'religion_focus' => [], 'languages' => [], 'specialties' => [], 'photos' => [$venuePhoto], 'subscription_tier' => 'premium', 'is_golpro' => false, 'rating' => 5.0],
            ['slug' => 'test-venue-free', 'name' => 'Thistle Johor Bahru', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Hotel Ballroom', 'price_from' => 5000, 'capacity' => '400 pax', 'religion_focus' => [], 'languages' => [], 'specialties' => [], 'photos' => [$venuePhoto], 'subscription_tier' => 'free', 'is_golpro' => false, 'rating' => 5.0],
            // Background catalog venues for AI to test matching logic
            ['slug' => 'demo-jb-sri-ananta-temple-hall', 'name' => 'Demo Sri Ananta Temple Hall', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Hindu Temple', 'price_from' => 4800, 'capacity' => '500 pax', 'religion_focus' => ['Indian', 'Tamil', 'Telugu'], 'languages' => ['Tamil', 'Telugu', 'English'], 'specialties' => ['Tamil ceremonies', 'Telugu ceremonies', 'Vegetarian kitchen'], 'photos' => [$templePhoto]],
            ['slug' => 'demo-skudai-lakshmi-mandapam', 'name' => 'Demo Lakshmi Mandapam Skudai', 'area' => 'Skudai', 'state' => 'Johor', 'style' => 'Hindu Temple', 'price_from' => 6500, 'capacity' => '700 pax', 'religion_focus' => ['Indian', 'Hindu'], 'languages' => ['Tamil', 'English'], 'specialties' => ['Oonjal setup', 'Homam facilities', 'Banana-leaf dining'], 'photos' => [$templePhoto]],
            ['slug' => 'demo-kulai-venkateswara-hall', 'name' => 'Demo Venkateswara Cultural Hall', 'area' => 'Kulai', 'state' => 'Johor', 'style' => 'Hindu Temple', 'price_from' => 5200, 'capacity' => '600 pax', 'religion_focus' => ['Indian', 'Telugu'], 'languages' => ['Telugu', 'Tamil', 'English'], 'specialties' => ['Jeelakarra Bellam setup', 'Talambralu ceremony', 'Traditional mandap'], 'photos' => [$templePhoto]],
            ['slug' => 'demo-jb-jade-lotus-temple-hall', 'name' => 'Demo Jade Lotus Chinese Temple Hall', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Chinese Temple', 'price_from' => 4200, 'capacity' => '450 pax', 'religion_focus' => ['Chinese'], 'languages' => ['Mandarin', 'Cantonese', 'English'], 'specialties' => ['Tea ceremony', 'Chinese banquet', 'Traditional altar'], 'photos' => [$templePhoto]],
            ['slug' => 'demo-masai-prosperity-temple', 'name' => 'Demo Prosperity Temple Banquet Hall', 'area' => 'Masai', 'state' => 'Johor', 'style' => 'Chinese Temple', 'price_from' => 3800, 'capacity' => '350 pax', 'religion_focus' => ['Chinese'], 'languages' => ['Mandarin', 'Hokkien'], 'specialties' => ['Tea ceremony', 'Ancestor blessings', 'Banquet seating'], 'photos' => [$templePhoto]],
            ['slug' => 'demo-jb-seri-iman-mosque-hall', 'name' => 'Demo Seri Iman Mosque Hall', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Mosque Hall', 'price_from' => 3500, 'capacity' => '600 pax', 'religion_focus' => ['Malay', 'Muslim'], 'languages' => ['Bahasa Malaysia', 'English'], 'specialties' => ['Akad nikah', 'Halal catering', 'Bersanding'], 'photos' => [$mosquePhoto]],
            ['slug' => 'demo-pasir-gudang-an-nur-hall', 'name' => 'Demo An-Nur Nikah Hall', 'area' => 'Pasir Gudang', 'state' => 'Johor', 'style' => 'Mosque Hall', 'price_from' => 2800, 'capacity' => '400 pax', 'religion_focus' => ['Malay', 'Muslim'], 'languages' => ['Bahasa Malaysia'], 'specialties' => ['Akad nikah', 'Family reception', 'Prayer facilities'], 'photos' => [$mosquePhoto]],
            ['slug' => 'demo-jb-grace-chapel', 'name' => 'Demo Grace Chapel Wedding Hall', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Church', 'price_from' => 4500, 'capacity' => '300 pax', 'religion_focus' => ['Christian'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['Church ceremony', 'Choir', 'Reception hall'], 'photos' => [$churchPhoto]],
            ['slug' => 'demo-jb-guru-nanak-darbar', 'name' => 'Demo Guru Nanak Darbar Hall', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Gurdwara', 'price_from' => 4000, 'capacity' => '500 pax', 'religion_focus' => ['Sikh', 'Punjabi'], 'languages' => ['Punjabi', 'English', 'Bahasa Malaysia'], 'specialties' => ['Anand Karaj', 'Langar facilities', 'Family hall'], 'photos' => [$venuePhoto]],
            ['slug' => 'demo-jb-harmoni-civic-hall', 'name' => 'Demo Harmoni Civic Wedding Hall', 'area' => 'Johor Bahru', 'state' => 'Johor', 'style' => 'Civil Hall', 'price_from' => 5500, 'capacity' => '650 pax', 'religion_focus' => ['Civil'], 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil'], 'specialties' => ['Civil ceremony', 'Flexible catering', 'Accessible venue'], 'photos' => [$venuePhoto]],
        ];

        foreach ($venues as $index => $venue) {
            Vendor::updateOrCreate(['slug' => $venue['slug']], [
                ...$venue,
                'vendor_category_id' => $venueId,
                'venue_type' => 'Indoor ceremonial venue',
                'address' => $venue['address'] ?? ($venue['area'] . ', ' . $venue['state'] . ' (Demo profile)'),
                'bio' => 'Fictional demonstration profile created for Golden Promise user-acceptance testing.',
                'description' => 'This is a fictional venue used to test cultural, location, capacity, and budget matching.',
                'rating' => $venue['rating'] ?? (4.3 + (($index % 6) / 10)),
                'review_count' => 12 + ($index * 3),
                'is_verified' => true,
                'is_approved' => true,
                'subscription_tier' => $venue['subscription_tier'] ?? ($index % 4 === 0 ? 'golpro' : 'premium'),
                'is_golpro' => $venue['is_golpro'] ?? ($index % 4 === 0),
                'facebook' => $venue['facebook'] ?? null,
                'tiktok' => $venue['tiktok'] ?? null,
                'instagram' => $venue['instagram'] ?? null,
                'brochure_path' => $venue['brochure_path'] ?? null,
                'whatsapp_phone' => '6012999' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
            ]);
        }

        $vendors = [
            // Core test vendors
            ['category' => 'caterer', 'photo' => $catererPhoto, 'slug' => 'test-vendor-elite', 'name' => 'JB Grand Catering', 'price_from' => 50, 'religion_focus' => [], 'languages' => [], 'specialties' => [], 'subscription_tier' => 'golpro', 'is_golpro' => true, 'rating' => 5.0],
            ['category' => 'videographer-photographer', 'photo' => $photoVideoPhoto, 'slug' => 'test-vendor-premium', 'name' => 'Johor Elite Studios', 'price_from' => 2200, 'religion_focus' => [], 'languages' => [], 'specialties' => [], 'subscription_tier' => 'premium', 'is_golpro' => false, 'rating' => 5.0],
            ['category' => 'florist', 'photo' => $floristPhoto, 'slug' => 'test-vendor-free', 'name' => 'Mutiara Floral Design', 'price_from' => 900, 'religion_focus' => [], 'languages' => [], 'specialties' => [], 'subscription_tier' => 'free', 'is_golpro' => false, 'rating' => 5.0],
            // Background catalog vendors for AI to test matching logic
            ['category' => 'caterer', 'photo' => $catererPhoto, 'slug' => 'demo-jb-south-indian-feast', 'name' => 'Demo South Indian Feast Catering', 'price_from' => 38, 'religion_focus' => ['Indian', 'Tamil', 'Telugu'], 'languages' => ['Tamil', 'Telugu', 'English'], 'specialties' => ['Vegetarian banana leaf', 'Tamil menu', 'Telugu menu']],
            ['category' => 'caterer', 'photo' => $catererPhoto, 'slug' => 'demo-jb-halal-celebrations', 'name' => 'Demo Halal Celebrations Catering', 'price_from' => 32, 'religion_focus' => ['Malay', 'Muslim'], 'languages' => ['Bahasa Malaysia', 'English'], 'specialties' => ['Halal buffet', 'Malay cuisine']],
            ['category' => 'caterer', 'photo' => $catererPhoto, 'slug' => 'demo-jb-jade-banquet', 'name' => 'Demo Jade Chinese Banquet', 'price_from' => 48, 'religion_focus' => ['Chinese'], 'languages' => ['Mandarin', 'English'], 'specialties' => ['Chinese banquet', 'Tea ceremony refreshments']],
            ['category' => 'videographer-photographer', 'photo' => $photoVideoPhoto, 'slug' => 'demo-jb-sacred-moments-studio', 'name' => 'Demo Sacred Moments Studio', 'price_from' => 2200, 'religion_focus' => ['Indian', 'Malay', 'Chinese', 'Christian', 'Sikh'], 'languages' => ['English', 'Bahasa Malaysia', 'Tamil', 'Mandarin'], 'specialties' => ['Temple ceremonies', 'Nikah', 'Tea ceremony', 'Church weddings']],
            ['category' => 'florist', 'photo' => $floristPhoto, 'slug' => 'demo-jb-ritual-blooms', 'name' => 'Demo Ritual Blooms Johor', 'price_from' => 900, 'religion_focus' => ['Indian', 'Chinese', 'Malay'], 'languages' => ['English', 'Tamil', 'Mandarin'], 'specialties' => ['Temple garlands', 'Mandap flowers', 'Chinese altar flowers']],
            ['category' => 'makeup-artist', 'photo' => $makeupPhoto, 'slug' => 'demo-jb-heritage-bridal-artistry', 'name' => 'Demo Heritage Bridal Artistry', 'price_from' => 650, 'religion_focus' => ['Indian', 'Malay', 'Chinese'], 'languages' => ['English', 'Tamil', 'Bahasa Malaysia', 'Mandarin'], 'specialties' => ['Tamil bridal', 'Telugu bridal', 'Hijab styling', 'Chinese bridal']],
        ];

        foreach ($vendors as $index => $vendor) {
            $categoryId = $categoryIds[$vendor['category']] ?? null;
            if (!$categoryId) continue;
            $category = $vendor['category'];
            unset($vendor['category']);
            $photo = $vendor['photo'];
            unset($vendor['photo']);
            Vendor::updateOrCreate(['slug' => $vendor['slug']], [
                ...$vendor,
                'vendor_category_id' => $categoryId,
                'area' => 'Johor Bahru',
                'state' => 'Johor',
                'address' => 'Johor Bahru, Johor (Demo profile)',
                'bio' => 'Fictional demonstration vendor for Golden Promise testing.',
                'rating' => $vendor['rating'] ?? (4.4 + (($index % 5) / 10)),
                'review_count' => 15 + ($index * 4),
                'photos' => [$photo],
                'is_verified' => true,
                'is_approved' => true,
                'subscription_tier' => $vendor['subscription_tier'] ?? 'premium',
                'is_golpro' => $vendor['is_golpro'] ?? false,
                'whatsapp_phone' => '6012888' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
            ]);
        }

        // Link test vendor profiles to actual user accounts
        $free = \App\Models\User::where('email', 'vendor@goldenpromise.my')->first();
        $prem = \App\Models\User::where('email', 'vendorpremium@goldenpromise.my')->first();
        $elite = \App\Models\User::where('email', 'vendorelite@goldenpromise.my')->first();

        if($free) \App\Models\Vendor::where('slug', 'test-vendor-free')->update(['user_id' => $free->id]);
        if($prem) \App\Models\Vendor::where('slug', 'test-vendor-premium')->update(['user_id' => $prem->id]);
        if($elite) \App\Models\Vendor::where('slug', 'test-vendor-elite')->update(['user_id' => $elite->id]);
    }
}
