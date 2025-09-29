<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_devuelve_token_y_usuario(): void
    {
        $this->seed();
        $empleadoRole = Role::where('slug','empleado')->first();
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('password123'),
            'id_rol' => $empleadoRole?->id_rol
        ]);

        $resp = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123'
        ]);

        $resp->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'token_type',
                'user' => [
                    'id_usuario','email','role' => ['slug']
                ]
            ]);
    }
}
