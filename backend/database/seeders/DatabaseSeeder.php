<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@goldenpromise.my'],
            ['name' => 'Golden Admin', 'password' => Hash::make('password'), 'role' => 'admin'],
        );

        User::updateOrCreate(
            ['email' => 'couple@goldenpromise.my'],
            [
                'name' => 'Yaashniny',
                'password' => Hash::make('password'),
                'role' => 'couple',
                'partner_name' => 'Aishwarya',
                'wedding_date' => now()->addMonths(6)->toDateString(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'vendor@goldenpromise.my'],
            ['name' => 'Leonard Hon', 'password' => Hash::make('password'), 'role' => 'vendor'],
        );

        User::updateOrCreate(
            ['email' => 'vendorpremium@goldenpromise.my'],
            ['name' => 'Premium Vendor Test', 'password' => Hash::make('password'), 'role' => 'vendor'],
        );

        User::updateOrCreate(
            ['email' => 'vendorelite@goldenpromise.my'],
            ['name' => 'Elite Vendor Test', 'password' => Hash::make('password'), 'role' => 'vendor'],
        );

        $this->call(CatalogSeeder::class);
        $this->call(DemoDirectorySeeder::class);
        $this->call(UniqueVenuePhotoSeeder::class);
    }
}
