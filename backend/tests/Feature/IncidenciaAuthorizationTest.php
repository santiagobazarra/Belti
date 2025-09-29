<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Incidencia;
use Laravel\Sanctum\Sanctum;

class IncidenciaAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    private function empleado(): User
    {
        return User::factory()->create();
    }

    public function test_empleado_no_puede_modificar_estado()
    {
        $empleado = $this->empleado();
        Sanctum::actingAs($empleado);
        $inc = Incidencia::factory()->create([
            'id_usuario'=>$empleado->id_usuario,
            'fecha'=>now()->toDateString(),
            'tipo'=>'otra'
        ]);
        $resp = $this->patchJson('/api/incidencias/'.$inc->id_incidencia,[
            'estado'=>'aprobada',
            'comentario_revision'=>'x',
            'hora_inicio'=>'08:00',
            'hora_fin'=>'16:00'
        ]);
        $resp->assertStatus(403)->assertJsonPath('error.code','FORBIDDEN');
    }
}
