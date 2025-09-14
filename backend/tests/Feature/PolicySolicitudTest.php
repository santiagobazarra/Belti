<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Solicitud;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolicySolicitudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_empleado_no_puede_eliminar_solicitud_no_pendiente(): void
    {
        $empleado = User::factory()->create();
        $sol = Solicitud::factory()->create([
            'id_usuario' => $empleado->id_usuario,
            'estado' => 'aprobada'
        ]);
        $this->actingAs($empleado);
        $resp = $this->deleteJson("/api/solicitudes/{$sol->id_solicitud}");
        $resp->assertStatus(403);
    }

    public function test_empleado_no_puede_ver_solicitud_ajena(): void
    {
        $empleado1 = User::factory()->create();
        $empleado2 = User::factory()->create();
        $sol = Solicitud::factory()->create([
            'id_usuario' => $empleado1->id_usuario
        ]);
        $this->actingAs($empleado2);
        $resp = $this->getJson("/api/solicitudes/{$sol->id_solicitud}");
        $resp->assertStatus(403);
    }

    public function test_admin_puede_aprobar_solicitud(): void
    {
    $adminRoleId = Role::where('slug','administrador')->value('id_rol');
    $admin = User::factory()->create(['id_rol' => $adminRoleId]);
        $empleado = User::factory()->create();
        $sol = Solicitud::factory()->create([
            'id_usuario' => $empleado->id_usuario,
            'estado' => 'pendiente'
        ]);
        $this->actingAs($admin);
        $resp = $this->patchJson("/api/solicitudes/{$sol->id_solicitud}", [ 'estado' => 'aprobada' ]);
        $resp->assertStatus(200)->assertJsonFragment(['estado' => 'aprobada']);
    }

    public function test_empleado_actualiza_motivo_propio_pendiente(): void
    {
        $empleado = User::factory()->create();
        $sol = Solicitud::factory()->create([
            'id_usuario' => $empleado->id_usuario,
            'estado' => 'pendiente'
        ]);
        $this->actingAs($empleado);
        $resp = $this->patchJson("/api/solicitudes/{$sol->id_solicitud}", [ 'motivo' => 'Cambio de motivo' ]);
        $resp->assertStatus(200)->assertJsonFragment(['motivo' => 'Cambio de motivo']);
    }
}
