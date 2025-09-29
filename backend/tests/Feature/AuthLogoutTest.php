<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AuthLogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_logout_revoca_token_en_bd(): void
    {
        $this->seed();
        $empleadoRole = Role::where('slug','empleado')->first();
        $user = User::factory()->create([
            'email' => 'logout@example.com',
            'password' => Hash::make('secret123'),
            'id_rol' => $empleadoRole?->id_rol
        ]);

        $login = $this->postJson('/api/login',[ 'email'=>'logout@example.com','password'=>'secret123']);
        $login->assertStatus(200);
        $token = $login->json('token');

        $logout = $this->withHeaders([
            'Authorization'=>'Bearer '.$token,
            'Accept'=>'application/json',
            'X-Requested-With'=>'XMLHttpRequest'
        ])->postJson('/api/logout');
        $logout->assertStatus(200)->assertJsonPath('success',true);

        // Verificar que el token ya no existe en la tabla personal_access_tokens
        $this->assertDatabaseMissing('personal_access_tokens', [
            // id es la parte antes del pipe
            'id' => (int) explode('|', $token)[0],
        ]);
    }

    public function test_logout_es_idempotente_devuelve_200(): void
    {
        $this->seed();
        $empleadoRole = Role::where('slug','empleado')->first();
        $user = User::factory()->create([
            'email' => 'logout2@example.com',
            'password' => Hash::make('secret123'),
            'id_rol' => $empleadoRole?->id_rol
        ]);

        $login = $this->postJson('/api/login',[ 'email'=>'logout2@example.com','password'=>'secret123']);
        $token = $login->json('token');
        $this->withHeaders([
            'Authorization'=>'Bearer '.$token,
            'Accept'=>'application/json',
            'X-Requested-With'=>'XMLHttpRequest'
        ])->postJson('/api/logout')->assertStatus(200);
        // Segundo logout con el mismo token ya revocado: sigue 200 (idempotente)
        $second = $this->withHeaders([
            'Authorization'=>'Bearer '.$token,
            'Accept'=>'application/json',
            'X-Requested-With'=>'XMLHttpRequest'
        ])->postJson('/api/logout');
        $second->assertStatus(200);
    }
}
