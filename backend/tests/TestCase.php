<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        // Forzar uso exclusivo de personal access tokens en tests
        config([
            'sanctum.stateful' => [], // evita autenticación por cookies de dominio
        ]);
    }
}
