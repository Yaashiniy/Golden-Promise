<?php

namespace Tests\Unit;

use App\Services\AI\GroqService;
use App\Services\PlannerGeneratorService;
use ReflectionMethod;
use Tests\TestCase;

class PlannerGeneratorKnowledgeTest extends TestCase
{
    public function test_compound_tamil_telugu_culture_loads_both_vault_sources(): void
    {
        $service = new PlannerGeneratorService($this->createMock(GroqService::class));
        $method = new ReflectionMethod($service, 'loadKnowledge');
        $knowledge = $method->invoke($service, 'Tamil + Telugu');

        $this->assertStringContainsString('Tamil Hindu Wedding', $knowledge);
        $this->assertStringContainsString('Telugu Hindu Wedding', $knowledge);
        $this->assertStringContainsString('Jeelakarra Bellam', $knowledge);
        $this->assertStringContainsString('Maalai Maatral', $knowledge);
    }
}
