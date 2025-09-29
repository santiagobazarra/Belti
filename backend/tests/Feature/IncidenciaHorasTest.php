<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Incidencia;
use Laravel\Sanctum\Sanctum;

class IncidenciaHorasTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    private function crearAdmin(): User
    {
        $rol = \App\Models\Role::factory()->create(['slug'=>'administrador']);
        return User::factory()->create(['email'=>'admin@example.com','id_rol'=>$rol->id_rol]);
    }

    public function test_requiere_rango_para_tipo_anomalia()
    {
        Sanctum::actingAs(User::factory()->create());
        $resp = $this->postJson('/api/incidencias',[ 'fecha'=>now()->toDateString(),'tipo'=>'anomalia_horas']);
        $resp->assertStatus(422)->assertJsonPath('error.code','VALIDATION_ERROR');
    }

    public function test_crear_y_aprobar_generando_jornada()
    {
        $admin = $this->crearAdmin();
        Sanctum::actingAs($admin);
        $resp = $this->postJson('/api/incidencias',[
            'fecha'=>now()->toDateString(),
            'tipo'=>'anomalia_horas',
            'hora_inicio'=>'08:00',
            'hora_fin'=>'15:00',
            'descripcion'=>'Olvido fichaje'
        ]);
        $resp->assertStatus(201);
        $id = $resp->json('id_incidencia');
    $apr = $this->patchJson("/api/incidencias/$id/aprobar");
    $apr->assertOk()->assertJsonPath('estado','aprobada');
        $jornadas = $this->getJson('/api/jornadas?desde='.now()->toDateString().'&hasta='.now()->toDateString());
        $jornadas->assertOk();
    }
}
