<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'venues', 'name' => 'Venues', 'image' => 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'videographer-photographer', 'name' => 'Videographer & Photographer', 'image' => 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'caterer', 'name' => 'Caterer', 'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'cake-desserts', 'name' => 'Cake & Desserts', 'image' => 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'band-dj', 'name' => 'Band & DJ', 'image' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'florist', 'name' => 'Florist', 'image' => 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'henna-artist', 'name' => 'Henna Artist', 'image' => 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'makeup-artist', 'name' => 'Makeup Artist', 'image' => 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'],
            ['slug' => 'dancers', 'name' => 'Dancers', 'image' => 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80'],
        ];

        foreach ($categories as $i => $c) {
            VendorCategory::updateOrCreate(
                ['slug' => $c['slug']],
                ['name' => $c['name'], 'image' => $c['image'], 'position' => $i],
            );
        }

        $this->seedVenues();
        $this->seedVendors();
    }

    private function seedVenues(): void
    {
        // Distinct verified wedding venue photos
        $venueImages = [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80', // 0: Grand Crystal Ballroom (Mandarin Oriental KL)
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', // 1: Oceanfront Beach Resort (Westin Langkawi)
          'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80', // 2: Sunset Beach Lawn (Shangri-La Tanjung Aru)
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80', // 3: Colonial Seafront Lawn (Eastern & Oriental Penang)
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80', // 4: Luxury Chandelier Ballroom (Glenmarie Grand)
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', // 5: Modern Luxury Hall (The Aurora Johor)
          'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80', // 6: Outdoor Garden Villa (Denai Sepuloh)
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', // 7: Traditional Mandap Hall (Batu Caves / Sri Maha)
          'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80', // 8: 5-Star Hotel Pavilion (Sunway Resort)
        ];

        $venues = [
            // ---- Johor ----
            ['slug' => 'denai-sepuloh', 'name' => 'Denai Sepuloh', 'area' => 'Johor Bahru', 'state' => 'Johor', 'venue_type' => 'Outdoor / Indoor', 'style' => 'Garden Wedding', 'price_from' => 8000, 'rating' => 4.3, 'review_count' => 128, 'address' => '12, Jalan Denai 10, Kempas Baru, 81200 Johor Bahru', 'latitude' => 1.5430, 'longitude' => 103.6680, 'capacity' => '100–200 pax', 'is_all_inclusive' => true, 'is_verified' => true, 'religion_focus' => ['Malay', 'Chinese', 'Indian', 'Civil'], 'languages' => ['Bahasa Malaysia', 'English'], 'specialties' => ['Garden ceremony', 'Outdoor reception', 'Halal catering'], 'description' => "If you are planning to have a small intimate garden wedding with your loved ones, Denai Sepuloh is it! Located in Johor Bahru, this industrial-style architecture with a perfect touch of contemporary and urbanization gives a minimal yet classy wedding.", 'photos' => [$venueImages[6]], 'also_for' => ['Birthday Party', 'Dinner', 'Baby Shower', 'Engagement Ceremony']],
            ['slug' => 'aurora-johor', 'name' => 'The Aurora', 'area' => 'Johor Bahru', 'state' => 'Johor', 'venue_type' => 'Indoor', 'style' => 'Modern Ballroom', 'price_from' => 13500, 'rating' => 4.8, 'review_count' => 142, 'latitude' => 1.4900, 'longitude' => 103.7500, 'address' => 'Johor Bahru', 'is_verified' => true, 'religion_focus' => ['Malay', 'Chinese', 'Civil'], 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin'], 'specialties' => ['Grand ballroom', 'Halal kitchen', 'Live band'], 'photos' => [$venueImages[5]]],
            ['slug' => 'jb-skyline-rooftop', 'name' => 'JB Skyline Rooftop', 'area' => 'Johor Bahru', 'state' => 'Johor', 'venue_type' => 'Outdoor', 'style' => 'Modern', 'price_from' => 11000, 'rating' => 4.6, 'review_count' => 73, 'latitude' => 1.4655, 'longitude' => 103.7578, 'address' => 'Johor Bahru CBD', 'religion_focus' => ['Civil', 'Chinese', 'Indian'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['City view', 'Sunset cocktail', 'Modern'], 'photos' => [$venueImages[2]]],
            ['slug' => 'mersing-beachfront', 'name' => 'Mersing Beachfront Resort', 'area' => 'Mersing', 'state' => 'Johor', 'venue_type' => 'Beach', 'style' => 'Beach Wedding', 'price_from' => 12000, 'rating' => 4.7, 'review_count' => 88, 'latitude' => 2.4310, 'longitude' => 103.8390, 'address' => 'Mersing, Johor', 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Beachfront', 'Sunset ceremony', 'Destination'], 'photos' => [$venueImages[1]]],
            ['slug' => 'iskandar-puteri-ballroom', 'name' => 'Iskandar Puteri Ballroom', 'area' => 'Iskandar Puteri', 'state' => 'Johor', 'venue_type' => 'Indoor / Outdoor', 'style' => 'Modern', 'price_from' => 9000, 'rating' => 4.5, 'review_count' => 96, 'latitude' => 1.4280, 'longitude' => 103.6240, 'address' => 'Iskandar Puteri', 'religion_focus' => ['Malay', 'Chinese'], 'languages' => ['Bahasa Malaysia', 'English', 'Mandarin'], 'photos' => [$venueImages[4]]],

            // ---- Selangor ----
            ['slug' => 'glenmarie-grand', 'name' => 'Glenmarie Grand Ballroom', 'area' => 'Shah Alam', 'state' => 'Selangor', 'venue_type' => 'Indoor', 'style' => 'Luxury Ballroom', 'price_from' => 18000, 'rating' => 4.8, 'review_count' => 215, 'latitude' => 3.0850, 'longitude' => 101.5640, 'address' => 'Glenmarie, 40150 Shah Alam', 'is_verified' => true, 'religion_focus' => ['Malay', 'Chinese', 'Indian'], 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil'], 'specialties' => ['Luxury ballroom', 'Halal kitchen', '1000+ pax capacity'], 'photos' => [$venueImages[4]]],
            ['slug' => 'sunway-resort-grand', 'name' => 'Sunway Resort Grand Pavilion', 'area' => 'Petaling Jaya', 'state' => 'Selangor', 'venue_type' => 'Indoor', 'style' => 'Hotel Ballroom', 'price_from' => 22000, 'rating' => 4.7, 'review_count' => 187, 'latitude' => 3.0731, 'longitude' => 101.6045, 'is_verified' => true, 'religion_focus' => ['Malay', 'Chinese', 'Indian', 'Civil', 'Christian'], 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin'], 'specialties' => ['5-star hotel', 'Halal certified', 'Multi-cultural'], 'photos' => [$venueImages[8]]],
            ['slug' => 'klang-sri-mahamariamman', 'name' => 'Sri Maha Mariamman Temple Hall', 'area' => 'Klang', 'state' => 'Selangor', 'venue_type' => 'Indoor / Outdoor', 'style' => 'Hindu Temple', 'price_from' => 3500, 'rating' => 4.9, 'review_count' => 89, 'latitude' => 3.0408, 'longitude' => 101.4470, 'religion_focus' => ['Indian'], 'languages' => ['Tamil', 'English'], 'specialties' => ['Hindu wedding rituals', 'Vegetarian catering', 'Traditional setup'], 'photos' => [$venueImages[7]]],
            ['slug' => 'shah-alam-masjid-hall', 'name' => 'Masjid Sultan Salahuddin Hall', 'area' => 'Shah Alam', 'state' => 'Selangor', 'venue_type' => 'Indoor', 'style' => 'Mosque Hall', 'price_from' => 4500, 'rating' => 4.8, 'review_count' => 132, 'latitude' => 3.0788, 'longitude' => 101.5224, 'religion_focus' => ['Malay'], 'languages' => ['Bahasa Malaysia'], 'specialties' => ['Akad nikah', 'Bersanding', 'Halal catering'], 'photos' => [$venueImages[0]]],
            ['slug' => 'petaling-garden-villa', 'name' => 'Petaling Garden Villa', 'area' => 'Petaling Jaya', 'state' => 'Selangor', 'venue_type' => 'Outdoor', 'style' => 'Garden Wedding', 'price_from' => 14000, 'rating' => 4.6, 'review_count' => 64, 'latitude' => 3.1100, 'longitude' => 101.6300, 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['Garden ceremony', 'Pool deck', 'Modern decor'], 'photos' => [$venueImages[6]]],

            // ---- Kuala Lumpur ----
            ['slug' => 'klcc-mandarin-oriental', 'name' => 'Mandarin Oriental KL', 'area' => 'KLCC', 'state' => 'Kuala Lumpur', 'venue_type' => 'Indoor', 'style' => 'Luxury Hotel', 'price_from' => 35000, 'rating' => 4.9, 'review_count' => 312, 'latitude' => 3.1561, 'longitude' => 101.7100, 'is_verified' => true, 'religion_focus' => ['Malay', 'Chinese', 'Indian', 'Civil', 'Christian'], 'languages' => ['English', 'Mandarin', 'Bahasa Malaysia'], 'specialties' => ['5-star luxury', 'KLCC view', 'Multi-cuisine'], 'photos' => [$venueImages[0]]],
            ['slug' => 'kl-batu-caves-hall', 'name' => 'Batu Caves Wedding Hall', 'area' => 'Selayang', 'state' => 'Kuala Lumpur', 'venue_type' => 'Indoor / Outdoor', 'style' => 'Hindu Temple', 'price_from' => 4000, 'rating' => 4.8, 'review_count' => 174, 'latitude' => 3.2379, 'longitude' => 101.6840, 'is_verified' => true, 'religion_focus' => ['Indian'], 'languages' => ['Tamil', 'Hindi', 'English'], 'specialties' => ['Hindu rituals', 'Vegetarian feast', 'Iconic location'], 'photos' => [$venueImages[7]]],
            ['slug' => 'kl-trinity-church', 'name' => 'Holy Trinity Church KL', 'area' => 'Bukit Bintang', 'state' => 'Kuala Lumpur', 'venue_type' => 'Indoor', 'style' => 'Church', 'price_from' => 5500, 'rating' => 4.9, 'review_count' => 91, 'latitude' => 3.1466, 'longitude' => 101.7115, 'religion_focus' => ['Christian'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['Christian ceremony', 'Stained glass', 'Organ music'], 'photos' => [$venueImages[3]]],
            ['slug' => 'kl-grand-hyatt', 'name' => 'Grand Hyatt Kuala Lumpur', 'area' => 'KLCC', 'state' => 'Kuala Lumpur', 'venue_type' => 'Indoor', 'style' => 'Hotel Ballroom', 'price_from' => 28000, 'rating' => 4.8, 'review_count' => 256, 'latitude' => 3.1543, 'longitude' => 101.7126, 'is_verified' => true, 'religion_focus' => ['Malay', 'Chinese', 'Indian', 'Civil'], 'languages' => ['English', 'Mandarin', 'Bahasa Malaysia'], 'specialties' => ['5-star hotel', 'Halal kitchen', 'Tower view'], 'photos' => [$venueImages[8]]],

            // ---- Penang ----
            ['slug' => 'penang-eastern-oriental', 'name' => 'Eastern & Oriental Hotel', 'area' => 'George Town', 'state' => 'Penang', 'venue_type' => 'Indoor / Outdoor', 'style' => 'Colonial Heritage', 'price_from' => 20000, 'rating' => 4.9, 'review_count' => 198, 'latitude' => 5.4220, 'longitude' => 100.3360, 'is_verified' => true, 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['Heritage architecture', 'Seafront', 'Colonial elegance'], 'photos' => [$venueImages[3]]],
            ['slug' => 'penang-kek-lok-si', 'name' => 'Kek Lok Si Banquet Hall', 'area' => 'Air Itam', 'state' => 'Penang', 'venue_type' => 'Indoor', 'style' => 'Chinese Temple', 'price_from' => 6000, 'rating' => 4.7, 'review_count' => 104, 'latitude' => 5.3990, 'longitude' => 100.2740, 'religion_focus' => ['Chinese'], 'languages' => ['Mandarin', 'Hokkien', 'English'], 'specialties' => ['Tea ceremony', 'Chinese banquet', 'Traditional setup'], 'photos' => [$venueImages[7]]],
            ['slug' => 'penang-batu-ferringhi-resort', 'name' => 'Batu Ferringhi Beach Resort', 'area' => 'Batu Ferringhi', 'state' => 'Penang', 'venue_type' => 'Beach', 'style' => 'Beach Wedding', 'price_from' => 15000, 'rating' => 4.6, 'review_count' => 87, 'latitude' => 5.4750, 'longitude' => 100.2570, 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['Beachfront ceremony', 'Sunset', 'Destination wedding'], 'photos' => [$venueImages[1]]],

            // ---- Perak ----
            ['slug' => 'ipoh-syeun-hotel', 'name' => 'Syeun Hotel Grand Ballroom', 'area' => 'Ipoh', 'state' => 'Perak', 'venue_type' => 'Indoor', 'style' => 'Hotel Ballroom', 'price_from' => 12000, 'rating' => 4.5, 'review_count' => 76, 'latitude' => 4.5910, 'longitude' => 101.0820, 'religion_focus' => ['Malay', 'Chinese', 'Indian'], 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin'], 'specialties' => ['Halal', 'Multi-cultural', 'Hotel package'], 'photos' => [$venueImages[4]]],
            ['slug' => 'ipoh-kek-lok-tong', 'name' => 'Kek Lok Tong Cave Temple', 'area' => 'Ipoh', 'state' => 'Perak', 'venue_type' => 'Indoor', 'style' => 'Chinese Temple', 'price_from' => 4500, 'rating' => 4.8, 'review_count' => 52, 'latitude' => 4.5640, 'longitude' => 101.1240, 'religion_focus' => ['Chinese'], 'languages' => ['Mandarin', 'Cantonese'], 'specialties' => ['Cave setting', 'Traditional Chinese', 'Unique venue'], 'photos' => [$venueImages[7]]],

            // ---- Melaka ----
            ['slug' => 'melaka-majestic', 'name' => 'The Majestic Malacca', 'area' => 'Bandar Hilir', 'state' => 'Melaka', 'venue_type' => 'Indoor / Outdoor', 'style' => 'Colonial Heritage', 'price_from' => 16000, 'rating' => 4.8, 'review_count' => 145, 'latitude' => 2.1900, 'longitude' => 102.2500, 'is_verified' => true, 'religion_focus' => ['Civil', 'Chinese', 'Christian', 'Malay'], 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin'], 'specialties' => ['Peranakan heritage', 'Colonial mansion', 'Riverside'], 'photos' => [$venueImages[3]]],
            ['slug' => 'melaka-cheng-hoon-teng', 'name' => 'Cheng Hoon Teng Hall', 'area' => 'Bandar Hilir', 'state' => 'Melaka', 'venue_type' => 'Indoor', 'style' => 'Chinese Temple', 'price_from' => 3500, 'rating' => 4.7, 'review_count' => 68, 'latitude' => 2.1985, 'longitude' => 102.2470, 'religion_focus' => ['Chinese'], 'languages' => ['Mandarin', 'Hokkien'], 'specialties' => ['Oldest Chinese temple in Malaysia', 'Tea ceremony', 'Traditional'], 'photos' => [$venueImages[7]]],

            // ---- Negeri Sembilan ----
            ['slug' => 'seremban-royale-hotel', 'name' => 'Royale Hotel Seremban', 'area' => 'Seremban', 'state' => 'Negeri Sembilan', 'venue_type' => 'Indoor', 'style' => 'Hotel Ballroom', 'price_from' => 10000, 'rating' => 4.4, 'review_count' => 58, 'latitude' => 2.7297, 'longitude' => 101.9381, 'religion_focus' => ['Malay', 'Chinese', 'Indian'], 'languages' => ['Bahasa Malaysia', 'English', 'Mandarin'], 'photos' => [$venueImages[4]]],
            ['slug' => 'port-dickson-beach-resort', 'name' => 'Port Dickson Beach Resort', 'area' => 'Port Dickson', 'state' => 'Negeri Sembilan', 'venue_type' => 'Beach', 'style' => 'Beach Wedding', 'price_from' => 11000, 'rating' => 4.5, 'review_count' => 79, 'latitude' => 2.5240, 'longitude' => 101.7950, 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Beachfront', 'Close to KL'], 'photos' => [$venueImages[1]]],

            // ---- Pahang ----
            ['slug' => 'cameron-equatorial', 'name' => 'Equatorial Cameron Highlands', 'area' => 'Cameron Highlands', 'state' => 'Pahang', 'venue_type' => 'Indoor / Outdoor', 'style' => 'Highland Resort', 'price_from' => 17000, 'rating' => 4.7, 'review_count' => 92, 'latitude' => 4.4830, 'longitude' => 101.3850, 'is_verified' => true, 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['Highland views', 'Tea plantations', 'Cool weather'], 'photos' => [$venueImages[6]]],
            ['slug' => 'kuantan-hyatt-regency', 'name' => 'Hyatt Regency Kuantan', 'area' => 'Kuantan', 'state' => 'Pahang', 'venue_type' => 'Beach', 'style' => 'Beach Resort', 'price_from' => 14000, 'rating' => 4.6, 'review_count' => 71, 'latitude' => 3.8167, 'longitude' => 103.3500, 'religion_focus' => ['Malay', 'Civil', 'Chinese'], 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Halal kitchen', 'East coast beach'], 'photos' => [$venueImages[1]]],

            // ---- Kedah / Perlis / Kelantan / Terengganu ----
            ['slug' => 'langkawi-westin', 'name' => 'The Westin Langkawi', 'area' => 'Langkawi', 'state' => 'Kedah', 'venue_type' => 'Beach', 'style' => 'Luxury Beach', 'price_from' => 25000, 'rating' => 4.9, 'review_count' => 142, 'latitude' => 6.3760, 'longitude' => 99.7820, 'is_verified' => true, 'religion_focus' => ['Civil', 'Malay', 'Christian'], 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Luxury beachfront', 'Destination wedding', 'Halal-friendly'], 'photos' => [$venueImages[1]]],
            ['slug' => 'alor-setar-masjid-zahir', 'name' => 'Masjid Zahir Hall', 'area' => 'Alor Setar', 'state' => 'Kedah', 'venue_type' => 'Indoor', 'style' => 'Mosque Hall', 'price_from' => 3500, 'rating' => 4.7, 'review_count' => 48, 'latitude' => 6.1188, 'longitude' => 100.3697, 'religion_focus' => ['Malay'], 'languages' => ['Bahasa Malaysia'], 'specialties' => ['Akad nikah', 'Historic mosque'], 'photos' => [$venueImages[0]]],
            ['slug' => 'kota-bharu-grand-renai', 'name' => 'Grand Renai Hotel', 'area' => 'Kota Bharu', 'state' => 'Kelantan', 'venue_type' => 'Indoor', 'style' => 'Hotel Ballroom', 'price_from' => 8000, 'rating' => 4.4, 'review_count' => 36, 'latitude' => 6.1248, 'longitude' => 102.2381, 'religion_focus' => ['Malay'], 'languages' => ['Bahasa Malaysia', 'English'], 'specialties' => ['Halal', 'Bersanding'], 'photos' => [$venueImages[4]]],
            ['slug' => 'kuala-terengganu-marrybrown', 'name' => 'Primula Beach Hotel', 'area' => 'Kuala Terengganu', 'state' => 'Terengganu', 'venue_type' => 'Beach', 'style' => 'Beach Resort', 'price_from' => 9000, 'rating' => 4.3, 'review_count' => 41, 'latitude' => 5.3296, 'longitude' => 103.1370, 'religion_focus' => ['Malay', 'Civil'], 'languages' => ['Bahasa Malaysia', 'English'], 'specialties' => ['Beachfront', 'Halal'], 'photos' => [$venueImages[1]]],

            // ---- Sabah ----
            ['slug' => 'kk-shangri-la-tanjung-aru', 'name' => 'Shangri-La Tanjung Aru', 'area' => 'Kota Kinabalu', 'state' => 'Sabah', 'venue_type' => 'Beach', 'style' => 'Luxury Beach Resort', 'price_from' => 28000, 'rating' => 4.9, 'review_count' => 176, 'latitude' => 5.9669, 'longitude' => 116.0537, 'is_verified' => true, 'religion_focus' => ['Civil', 'Christian', 'Chinese'], 'languages' => ['English', 'Mandarin', 'Bahasa Malaysia'], 'specialties' => ['Sunset ceremony', 'Mt Kinabalu view', 'Destination wedding'], 'photos' => [$venueImages[2]]],
            ['slug' => 'kk-st-michael-church', 'name' => 'St. Michael & All Angels Church', 'area' => 'Sandakan', 'state' => 'Sabah', 'venue_type' => 'Indoor', 'style' => 'Church', 'price_from' => 4500, 'rating' => 4.8, 'review_count' => 39, 'latitude' => 5.8400, 'longitude' => 118.1200, 'religion_focus' => ['Christian'], 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Heritage church', 'Christian ceremony'], 'photos' => [$venueImages[3]]],

            // ---- Sarawak ----
            ['slug' => 'kuching-hilton', 'name' => 'Hilton Kuching Grand Ballroom', 'area' => 'Kuching', 'state' => 'Sarawak', 'venue_type' => 'Indoor', 'style' => 'Hotel Ballroom', 'price_from' => 15000, 'rating' => 4.7, 'review_count' => 104, 'latitude' => 1.5560, 'longitude' => 110.3460, 'is_verified' => true, 'religion_focus' => ['Civil', 'Chinese', 'Christian', 'Malay'], 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin'], 'specialties' => ['Riverside', 'Halal kitchen', 'Multi-cultural'], 'photos' => [$venueImages[2]]],
            ['slug' => 'kuching-sarawak-club', 'name' => 'The Sarawak Club', 'area' => 'Kuching', 'state' => 'Sarawak', 'venue_type' => 'Indoor / Outdoor', 'style' => 'Heritage Club', 'price_from' => 9500, 'rating' => 4.5, 'review_count' => 67, 'latitude' => 1.5495, 'longitude' => 110.3526, 'religion_focus' => ['Civil', 'Christian', 'Chinese'], 'languages' => ['English', 'Mandarin'], 'specialties' => ['Colonial heritage', 'Garden lawn'], 'photos' => [$venueImages[5]]],
        ];

        $catId = VendorCategory::where('slug', 'venues')->value('id');
        
        foreach ($venues as $v) {
            $v['photos'] = $v['photos'] ?? [];
            $v['also_for'] = $v['also_for'] ?? [];
            $v['vendor_category_id'] = $catId;
            $v['is_approved'] = true; // Auto-approve seeded venues
            Vendor::updateOrCreate(['slug' => $v['slug']], $v);
        }
    }

    private function seedVendors(): void
    {
        $cats = VendorCategory::pluck('id', 'slug');
        $vendorUser = User::where('email', 'vendor@goldenpromise.my')->first();
        $premiumUser = User::where('email', 'vendorpremium@goldenpromise.my')->first();
        $eliteUser = User::where('email', 'vendorelite@goldenpromise.my')->first();

        $rows = [
            // PREMIUM VENDOR TEST ACCOUNT
            [
                'slug' => 'premium-wedding-caterer', 'category' => 'caterer', 'name' => 'Premium Catering Services',
                'area' => 'Kuala Lumpur', 'state' => 'Kuala Lumpur',
                'address' => '12A, Jalan Ampang, Kuala Lumpur', 'latitude' => 3.1579, 'longitude' => 101.7116,
                'price_from' => 2500, 'rating' => 4.5, 'review_count' => 84,
                'is_verified' => false,
                'bio' => "Premium Catering Services offers exceptional culinary experiences for high-end multicultural weddings in KL.",
                'years_experience' => 6, 'languages' => ['English', 'Bahasa Malaysia'],
                'specialties' => ['Halal catering', 'Malay banquet', 'Chinese buffet'],
                'religion_focus' => ['Malay', 'Chinese', 'Civil'],
                'photos' => ['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80'],
                'user_id' => $premiumUser?->id,
                'subscription_tier' => 'premium',
            ],
            // ELITE VENDOR TEST ACCOUNT
            [
                'slug' => 'elite-wedding-caterer', 'category' => 'caterer', 'name' => 'Elite Catering Services',
                'area' => 'Kuala Lumpur', 'state' => 'Kuala Lumpur',
                'address' => '8, Jalan Ampang, Kuala Lumpur', 'latitude' => 3.1570, 'longitude' => 101.7110,
                'price_from' => 5000, 'rating' => 4.9, 'review_count' => 112,
                'is_verified' => false,
                'bio' => "Elite Catering Services offers Michelin-tier luxury banquets for elite weddings in Malaysia.",
                'years_experience' => 10, 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin'],
                'specialties' => ['Michelin catering', 'VIP service', 'Custom menus'],
                'religion_focus' => ['Malay', 'Chinese', 'Civil', 'Christian'],
                'photos' => ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'],
                'user_id' => $eliteUser?->id,
                'subscription_tier' => 'golpro',
                'is_golpro' => true,
            ],
            // PHOTOGRAPHERS
            [
                'slug' => 'leonard-hon-signature', 'category' => 'videographer-photographer', 'name' => 'Leonard Hon Signature',
                'area' => 'Petaling Jaya', 'state' => 'Selangor',
                'address' => '60B, Jalan SS 2/72, Petaling Jaya', 'latitude' => 3.1146, 'longitude' => 101.6240,
                'price_from' => 1000, 'rating' => 4.3, 'review_count' => 173,
                'instagram' => 'leonardhon', 'is_golpro' => true, 'is_verified' => true,
                'bio' => "Leonard Hon is one of Malaysia's most-loved wedding photographers, with 12+ years capturing Hindu, Indian and multicultural weddings across the peninsula.\n\nKnown for vivid storytelling, candid moments and award-winning post-production.",
                'experiences' => 'Cinematography, photography, post-production. Specialised in Hindu and Indian weddings.',
                'years_experience' => 12, 'languages' => ['English', 'Bahasa Malaysia', 'Tamil', 'Hindi'],
                'specialties' => ['Hindu weddings', 'Indian weddings', 'Outdoor', 'Drone shots', 'Same-day edit'],
                'religion_focus' => ['Indian', 'Malay', 'Chinese'],
                'response_time_hours' => 2, 'response_rate_percent' => 99,
                'photos' => ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=1200&q=80'],
                'user_id' => $vendorUser?->id,
            ],
            ['slug' => 'aji-studio', 'category' => 'videographer-photographer', 'name' => 'AJI Studio', 'area' => 'Kuala Lumpur', 'state' => 'Kuala Lumpur', 'price_from' => 1800, 'rating' => 4.7, 'latitude' => 3.1390, 'longitude' => 101.6869, 'is_verified' => true, 'bio' => "AJI Studio is a Kuala Lumpur-based wedding photography studio specialising in luxury, editorial-style imagery for modern couples.", 'languages' => ['English', 'Bahasa Malaysia', 'Mandarin'], 'specialties' => ['Luxury weddings', 'Editorial style'], 'religion_focus' => ['Chinese', 'Civil', 'Christian'], 'years_experience' => 8, 'response_time_hours' => 4, 'photos' => ['https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'nedwear-digital', 'category' => 'videographer-photographer', 'name' => 'Nedwear Digital', 'area' => 'Johor Bahru', 'state' => 'Johor', 'price_from' => 1500, 'rating' => 4.4, 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Cinematic video', 'Drone'], 'religion_focus' => ['Malay', 'Chinese'], 'years_experience' => 5, 'photos' => ['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'penang-lens-co', 'category' => 'videographer-photographer', 'name' => 'Penang Lens Co.', 'area' => 'George Town', 'state' => 'Penang', 'price_from' => 1300, 'rating' => 4.6, 'languages' => ['English', 'Mandarin', 'Hokkien'], 'specialties' => ['Chinese weddings', 'Heritage photography'], 'religion_focus' => ['Chinese', 'Civil'], 'years_experience' => 6, 'photos' => ['https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'sabah-borneo-studio', 'category' => 'videographer-photographer', 'name' => 'Borneo Wedding Studio', 'area' => 'Kota Kinabalu', 'state' => 'Sabah', 'price_from' => 1700, 'rating' => 4.7, 'is_verified' => true, 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Destination weddings', 'Beach ceremonies'], 'religion_focus' => ['Civil', 'Christian'], 'years_experience' => 7, 'photos' => ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1200&q=80']],

            // CATERERS
            ['slug' => 'royal-feast-caterer', 'category' => 'caterer', 'name' => 'Royal Feast Catering', 'area' => 'Johor Bahru', 'state' => 'Johor', 'price_from' => 35, 'rating' => 4.6, 'is_verified' => true, 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Halal catering', 'Malay cuisine', 'Buffet'], 'religion_focus' => ['Malay'], 'years_experience' => 10, 'photos' => ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'taj-mahal-caterers', 'category' => 'caterer', 'name' => 'Taj Mahal Indian Caterers', 'area' => 'Klang', 'state' => 'Selangor', 'price_from' => 45, 'rating' => 4.8, 'is_verified' => true, 'languages' => ['Tamil', 'Hindi', 'English'], 'specialties' => ['Indian cuisine', 'Vegetarian', 'Banana leaf'], 'religion_focus' => ['Indian'], 'years_experience' => 15, 'photos' => ['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'tien-jia-banquet', 'category' => 'caterer', 'name' => 'Tien Jia Chinese Banquet', 'area' => 'Petaling Jaya', 'state' => 'Selangor', 'price_from' => 55, 'rating' => 4.7, 'languages' => ['Mandarin', 'Cantonese', 'English'], 'specialties' => ['Chinese banquet', 'Seafood', '10-course dinner'], 'religion_focus' => ['Chinese'], 'years_experience' => 12, 'photos' => ['https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&fit=crop&w=1200&q=80']],

            // FLORISTS
            ['slug' => 'tang-chao-florist', 'category' => 'florist', 'name' => 'Tang Chao Florist', 'area' => 'Johor Bahru', 'state' => 'Johor', 'price_from' => 800, 'rating' => 4.5, 'is_verified' => true, 'languages' => ['English', 'Mandarin', 'Bahasa Malaysia'], 'specialties' => ['Fresh flowers', 'Arch & aisle'], 'religion_focus' => ['Civil', 'Chinese', 'Malay'], 'years_experience' => 9, 'photos' => ['https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'penang-petal-paradise', 'category' => 'florist', 'name' => 'Petal Paradise Penang', 'area' => 'George Town', 'state' => 'Penang', 'price_from' => 700, 'rating' => 4.6, 'languages' => ['English', 'Mandarin'], 'specialties' => ['Tropical arrangements', 'Hindu garlands'], 'religion_focus' => ['Indian', 'Chinese', 'Civil'], 'years_experience' => 7, 'photos' => ['https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80']],

            // CAKES
            ['slug' => 'sakhti-boutique', 'category' => 'cake-desserts', 'name' => 'Sakhti Boutique Cakes', 'area' => 'Johor Bahru', 'state' => 'Johor', 'price_from' => 350, 'rating' => 4.4, 'languages' => ['English', 'Tamil'], 'specialties' => ['Custom designs', 'Fondant'], 'religion_focus' => ['Indian', 'Civil'], 'years_experience' => 5, 'photos' => ['https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'kl-cake-couture', 'category' => 'cake-desserts', 'name' => 'KL Cake Couture', 'area' => 'Mont Kiara', 'state' => 'Kuala Lumpur', 'price_from' => 600, 'rating' => 4.8, 'is_verified' => true, 'languages' => ['English', 'Mandarin'], 'specialties' => ['Luxury cakes', 'Sugar flowers', 'Multi-tier'], 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'years_experience' => 8, 'photos' => ['https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=1200&q=80']],

            // BAND & DJ
            ['slug' => 'dj-revvy', 'category' => 'band-dj', 'name' => 'DJ Revvy', 'area' => 'Johor Bahru', 'state' => 'Johor', 'price_from' => 1500, 'rating' => 4.5, 'is_verified' => true, 'languages' => ['English', 'Bahasa Malaysia'], 'specialties' => ['Top 40', 'Bollywood', 'MC services'], 'religion_focus' => ['Indian', 'Malay', 'Civil'], 'years_experience' => 8, 'photos' => ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'soulwave-live', 'category' => 'band-dj', 'name' => 'Soulwave Live Band', 'area' => 'Kuala Lumpur', 'state' => 'Kuala Lumpur', 'price_from' => 2800, 'rating' => 4.7, 'is_verified' => true, 'languages' => ['English', 'Mandarin'], 'specialties' => ['Live band', 'Jazz', 'Acoustic'], 'religion_focus' => ['Civil', 'Chinese', 'Christian'], 'years_experience' => 10, 'photos' => ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80']],

            // HENNA
            ['slug' => 'henna-by-priya', 'category' => 'henna-artist', 'name' => 'Henna by Priya', 'area' => 'Klang', 'state' => 'Selangor', 'price_from' => 250, 'rating' => 4.8, 'is_verified' => true, 'languages' => ['Tamil', 'English', 'Hindi'], 'specialties' => ['Bridal mehndi', 'Arabic style'], 'religion_focus' => ['Indian', 'Malay'], 'years_experience' => 11, 'photos' => ['https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'mehndi-arts-kl', 'category' => 'henna-artist', 'name' => 'Mehndi Arts KL', 'area' => 'Brickfields', 'state' => 'Kuala Lumpur', 'price_from' => 320, 'rating' => 4.6, 'languages' => ['Tamil', 'English', 'Hindi'], 'specialties' => ['Bridal mehndi', 'Guest henna'], 'religion_focus' => ['Indian'], 'years_experience' => 8, 'photos' => ['https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80']],

            // MAKEUP
            ['slug' => 'glow-by-aisha', 'category' => 'makeup-artist', 'name' => 'Glow by Aisha', 'area' => 'Johor Bahru', 'state' => 'Johor', 'price_from' => 550, 'rating' => 4.7, 'is_verified' => true, 'languages' => ['Bahasa Malaysia', 'English'], 'specialties' => ['Bridal makeup', 'Hijab styling'], 'religion_focus' => ['Malay'], 'years_experience' => 7, 'photos' => ['https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'penang-studio-luna', 'category' => 'makeup-artist', 'name' => 'Studio Luna MUA Penang', 'area' => 'Tanjung Tokong', 'state' => 'Penang', 'price_from' => 620, 'rating' => 4.6, 'languages' => ['English', 'Mandarin'], 'specialties' => ['Chinese bridal', 'Natural look'], 'religion_focus' => ['Chinese', 'Civil', 'Christian'], 'years_experience' => 6, 'photos' => ['https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=1200&q=80']],

            // DANCERS
            ['slug' => 'rhythm-of-india', 'category' => 'dancers', 'name' => 'Rhythm of India Dance Troupe', 'area' => 'Klang', 'state' => 'Selangor', 'price_from' => 1200, 'rating' => 4.7, 'languages' => ['English', 'Tamil', 'Hindi'], 'specialties' => ['Bollywood', 'Classical', 'Bhangra'], 'religion_focus' => ['Indian'], 'years_experience' => 9, 'photos' => ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80']],
            ['slug' => 'serikandi-stage', 'category' => 'dancers', 'name' => 'Serikandi Traditional Dancers', 'area' => 'Kuala Lumpur', 'state' => 'Kuala Lumpur', 'price_from' => 1500, 'rating' => 4.5, 'languages' => ['Bahasa Malaysia', 'English'], 'specialties' => ['Traditional Malay', 'Joget', 'Zapin'], 'religion_focus' => ['Malay'], 'years_experience' => 7, 'photos' => ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80']],
        ];

        // Deterministic-but-varied WhatsApp phones + subscription mix for the demo
        $tiers = ['golpro', 'premium', 'premium', 'premium', 'free', 'free', 'free', 'free'];
        foreach ($rows as $i => $r) {
            $catId = $cats[$r['category']] ?? null;
            if (!$catId) continue;
            $r['vendor_category_id'] = $catId;
            $r['is_approved'] = true;
            $r['is_golpro'] = $r['is_golpro'] ?? ($tiers[$i % 8] === 'golpro');
            // Assign a fake Malaysian WhatsApp number
            $r['whatsapp_phone'] = '6012' . str_pad((string) (3450000 + $i * 137), 7, '0', STR_PAD_LEFT);
            // Subscription mix — first vendor in each cycle gets GolPro
            $r['subscription_tier'] = $r['subscription_tier'] ?? $tiers[$i % 8];

            $r['photos'] = $r['photos'] ?? [];
            unset($r['category']);
            Vendor::updateOrCreate(['slug' => $r['slug']], $r);
        }

        if ($premiumUser) {
            $premiumVendor = Vendor::where('user_id', $premiumUser->id)->first();
            if ($premiumVendor) {
                \App\Models\VendorApplication::updateOrCreate(
                    ['created_vendor_id' => $premiumVendor->id],
                    [
                        'reference' => 'VER-PREMIUM',
                        'applicant_name' => $premiumUser->name,
                        'email' => $premiumUser->email,
                        'phone' => $premiumVendor->whatsapp_phone ?? '60123450000',
                        'business_name' => $premiumVendor->name,
                        'business_address' => $premiumVendor->address ?? '12A, Jalan Ampang, Kuala Lumpur',
                        'city' => $premiumVendor->area ?? 'Kuala Lumpur',
                        'state' => $premiumVendor->state ?? 'Kuala Lumpur',
                        'vendor_category_id' => $premiumVendor->vendor_category_id,
                        'business_type' => 'ssm',
                        'ssm_number' => '202607281452',
                        'ssm_doc_path' => 'seeders/sample-ssm.pdf',
                        'nric_or_passport_doc_path' => 'seeders/sample-nric.pdf',
                        'bank_name' => 'Bank Transfer',
                        'bank_account_number' => '1234567890',
                        'bank_account_holder' => $premiumUser->name,
                        'bio' => $premiumVendor->bio,
                        'status' => 'pending',
                        'created_user_id' => $premiumUser->id,
                    ]
                );
            }
        }
    }
}
