<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Role;

class ErrorResponsesTest extends TestCase
{
    use RefreshDatabase;

    private function authUser(string $roleSlug = 'empleado'): User
    {
        $this->seed();
        $role = \App\Models\Role::where('slug',$roleSlug)->first();
        return User::factory()->create(['id_rol' => $role?->id_rol]);
    }

    public function test_401_sin_token(): void
    {
    // Usamos /api/incidencias (recurso protegido siempre) para forzar 401
    $resp = $this->getJson('/api/incidencias');
        $resp->assertStatus(401)->assertJsonStructure(['success','error'=>['code','message']]);
        $this->assertEquals('UNAUTHENTICATED', $resp->json('error.code'));
    }

    public function test_403_prohibido(): void
    {
        $user = $this->authUser('empleado');
        $token = $user->createToken('t')->plainTextToken;
        $resp = $this->withHeader('Authorization','Bearer '.$token)->getJson('/api/roles');
        $resp->assertStatus(403)->assertJsonPath('error.code','FORBIDDEN');
    }

    public function test_404_ruta(): void
    {
        $resp = $this->getJson('/api/no-existe-endpoint');
        $resp->assertStatus(404)->assertJsonPath('error.code','NOT_FOUND');
    }

    public function test_404_model(): void
    {
        $user = $this->authUser('administrador');
        $token = $user->createToken('t')->plainTextToken;
        $resp = $this->withHeader('Authorization','Bearer '.$token)->getJson('/api/incidencias/999999');
        $resp->assertStatus(404)->assertJsonPath('error.code','NOT_FOUND');
    }

    public function test_422_validation(): void
    {
        $user = $this->authUser('empleado');
        $token = $user->createToken('t')->plainTextToken;
        $resp = $this->withHeader('Authorization','Bearer '.$token)->postJson('/api/incidencias', []);
        $resp->assertStatus(422)->assertJsonPath('error.code','VALIDATION_ERROR');
        $resp->assertJsonStructure(['error'=>['details'=>['fecha','tipo']]]);
    }

    public function test_401_me_endpoint_sin_token(): void
    {
        $resp = $this->getJson('/api/me');
        $resp->assertStatus(401)->assertJsonPath('error.code','UNAUTHENTICATED');
    }
}
