<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Incidencia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolicyIncidenciaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // seed or create roles
        $this->artisan('db:seed');
    }

    public function test_empleado_no_puede_modificar_incidencia_ajena(): void
    {
        $empleado1 = User::factory()->create();
        $empleado2 = User::factory()->create();
        $inc = Incidencia::factory()->create([
            'id_usuario' => $empleado1->id_usuario,
            'estado' => 'pendiente'
        ]);

        $this->actingAs($empleado2);
        $resp = $this->patchJson("/api/incidencias/{$inc->id_incidencia}", [ 'descripcion' => 'X' ]);
        $resp->assertStatus(403);
    }

    public function test_empleado_no_puede_modificar_incidencia_no_pendiente(): void
    {
        $empleado = User::factory()->create();
        $inc = Incidencia::factory()->create([
            'id_usuario' => $empleado->id_usuario,
            'estado' => 'revisada'
        ]);
        $this->actingAs($empleado);
        $resp = $this->patchJson("/api/incidencias/{$inc->id_incidencia}", [ 'descripcion' => 'Nueva desc' ]);
        $resp->assertStatus(403);
    }

    public function test_admin_puede_cambiar_estado(): void
    {
    $adminRoleId = Role::where('slug','administrador')->value('id_rol');
    $admin = User::factory()->create([ 'id_rol' => $adminRoleId ]);
        $empleado = User::factory()->create();
        $inc = Incidencia::factory()->create([
            'id_usuario' => $empleado->id_usuario,
            'estado' => 'pendiente'
        ]);
        $this->actingAs($admin);
        $resp = $this->patchJson("/api/incidencias/{$inc->id_incidencia}", [ 'estado' => 'revisada' ]);
        $resp->assertStatus(200)->assertJsonFragment(['estado' => 'revisada']);
    }

    public function test_empleado_actualiza_descripcion_propia_pendiente(): void
    {
        $empleado = User::factory()->create();
        $inc = Incidencia::factory()->create([
            'id_usuario' => $empleado->id_usuario,
            'estado' => 'pendiente'
        ]);
        $this->actingAs($empleado);
        $resp = $this->patchJson("/api/incidencias/{$inc->id_incidencia}", [ 'descripcion' => 'Nueva descripcion' ]);
        $resp->assertStatus(200)->assertJsonFragment(['descripcion' => 'Nueva descripcion']);
    }

    public function test_admin_puede_eliminar_incidencia_ajena(): void
    {
        $adminRoleId = Role::where('slug','administrador')->value('id_rol');
        $admin = User::factory()->create(['id_rol' => $adminRoleId]);
        $empleado = User::factory()->create();
        $inc = Incidencia::factory()->create([
            'id_usuario' => $empleado->id_usuario,
            'estado' => 'revisada'
        ]);
        $this->actingAs($admin);
        $resp = $this->deleteJson("/api/incidencias/{$inc->id_incidencia}");
        $resp->assertStatus(200)->assertJsonFragment(['deleted' => true]);
    }
}
