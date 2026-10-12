<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Seeder;

class UniqueVenuePhotoSeeder extends Seeder
{
    public function run(): void
    {
        $localPhotos = [
            'kl-batu-caves-hall' => '/venue-profiles/batu-caves-wedding-hall.png',
            'klang-sri-mahamariamman' => '/venue-profiles/hindu-temple-johor.png',
            'penang-kek-lok-si' => '/venue-profiles/chinese-temple-johor.png',
            'ipoh-kek-lok-tong' => '/venue-profiles/chinese-temple-johor.png',
            'melaka-cheng-hoon-teng' => '/venue-profiles/chinese-temple-johor.png',
            'shah-alam-masjid-hall' => '/venue-profiles/mosque-hall-johor.png',
            'alor-setar-masjid-zahir' => '/venue-profiles/mosque-hall-johor.png',
            'kl-trinity-church' => '/venue-profiles/church-hall-johor.png',
            'kk-st-michael-church' => '/venue-profiles/church-hall-johor.png',
            'demo-jb-sri-ananta-temple-hall' => '/venue-profiles/hindu-temple-johor.png',
            'demo-skudai-lakshmi-mandapam' => '/venue-profiles/hindu-temple-johor.png',
            'demo-kulai-venkateswara-hall' => '/venue-profiles/hindu-temple-johor.png',
            'demo-jb-jade-lotus-temple-hall' => '/venue-profiles/chinese-temple-johor.png',
            'demo-masai-prosperity-temple' => '/venue-profiles/chinese-temple-johor.png',
            'demo-jb-seri-iman-mosque-hall' => '/venue-profiles/mosque-hall-johor.png',
            'demo-pasir-gudang-an-nur-hall' => '/venue-profiles/mosque-hall-johor.png',
            'demo-jb-grace-chapel' => '/venue-profiles/church-hall-johor.png',
            'demo-jb-guru-nanak-darbar' => '/venue-profiles/gurdwara-hall-johor.png',
            'demo-jb-harmoni-civic-hall' => '/venue-profiles/civil-hall-johor.png',
        ];

        $photoIds = [
            '1519167758481-83f550bb49b3', '1507525428034-b723cf961d3e',
            '1510414842594-a61c69b5ae57', '1519225421980-715cb0215aed',
            '1464366400600-7168b8af9bc3', '1520854221256-17451cc331bf',
            '1465495976277-4387d4b0b4c6', '1583939003579-730e3918a45a',
            '1527529482837-4698179dc6ce', '1519741497674-611481863552',
            '1511285560929-80b456fea0bc', '1606216794074-735e91aa2c92',
            '1606800052052-a08af7148866', '1522673607200-164d1b6ce486',
            '1509610973147-232dfea52a97',
        ];

        $remoteIndex = 0;

        Vendor::query()
            ->whereHas('category', fn ($query) => $query->where('slug', 'venues'))
            ->orderBy('id')
            ->each(function (Vendor $venue) use ($localPhotos, $photoIds, &$remoteIndex) {
                if (isset($localPhotos[$venue->slug])) {
                    $venue->update(['photos' => [$localPhotos[$venue->slug]]]);
                    return;
                }

                $photoId = $photoIds[$remoteIndex % count($photoIds)];
                $remoteIndex++;

                $venue->update([
                    'photos' => ["https://images.unsplash.com/photo-{$photoId}?auto=format&fit=crop&w=1200&q=82"],
                ]);
            });
    }
}
