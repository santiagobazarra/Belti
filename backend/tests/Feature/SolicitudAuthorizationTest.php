<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Solicitud;
use Laravel\Sanctum\Sanctum;

class SolicitudAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_empleado_no_puede_modificar_estado()
    {
        $empleado = User::factory()->create();
        Sanctum::actingAs($empleado);
        $sol = Solicitud::factory()->create([
            'id_usuario'=>$empleado->id_usuario,
            'fecha_inicio'=>now()->toDateString(),
            'fecha_fin'=>now()->addDay()->toDateString(),
            'tipo'=>'vacaciones'
        ]);
        $resp = $this->patchJson('/api/solicitudes/'.$sol->id_solicitud,[
            'estado'=>'aprobada',
            'comentario_resolucion'=>'OK'
        ]);
        $resp->assertStatus(403)->assertJsonPath('error.code','FORBIDDEN');
    }
}
