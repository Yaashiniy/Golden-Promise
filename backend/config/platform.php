<?php

return [
    'name' => 'Golden Promise',
    'commission_rate' => env('PLATFORM_COMMISSION_RATE', 10) / 100,
    'currency' => 'MYR',
    'currency_symbol' => 'RM',
    'payment_default_gateway' => env('PAYMENT_GATEWAY', 'mock'),
];
