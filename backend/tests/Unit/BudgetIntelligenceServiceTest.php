<?php

namespace Tests\Unit;

use App\Models\BudgetCategory;
use App\Models\BudgetItem;
use App\Models\User;
use App\Services\BudgetIntelligenceService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class BudgetIntelligenceServiceTest extends TestCase
{
    public function test_it_calculates_catering_warning_and_mixed_culture_requirements(): void
    {
        $user = new User([
            'culture' => 'Tamil + Telugu',
            'guest_count' => 500,
            'wedding_location' => 'Johor Bahru, Johor',
        ]);
        $catering = new BudgetCategory(['name' => 'Catering', 'estimated' => 12000]);
        $catering->setRelation('items', new Collection());

        $result = (new BudgetIntelligenceService())->analyse($user, collect([$catering]), 60000);

        $this->assertSame(24, $result['catering_per_guest']);
        $this->assertCount(2, $result['culture_requirements']);
        $this->assertTrue(collect($result['warnings'])->contains(fn ($warning) => $warning['type'] === 'low_catering'));
        $this->assertArrayHasKey('breakdown', $result['health']);
    }

    public function test_it_flags_actual_category_costs_above_the_estimate(): void
    {
        $user = new User(['culture' => 'Civil', 'guest_count' => 100, 'wedding_location' => 'Johor Bahru, Johor']);
        $venue = new BudgetCategory(['name' => 'Venue', 'estimated' => 8000]);
        $venue->id = 12;
        $venue->setRelation('items', collect([
            new BudgetItem(['actual_cost' => 10000, 'paid_amount' => 8000]),
        ]));

        $result = (new BudgetIntelligenceService())->analyse($user, collect([$venue]), 60000);
        $warning = collect($result['warnings'])->firstWhere('type', 'category_overrun');

        $this->assertSame(10000, $result['actual_total']);
        $this->assertSame(2000, $warning['over_by']);
        $this->assertSame('Venue', $warning['category']);
    }
}
