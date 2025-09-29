<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Incidencia;
use Laravel\Sanctum\Sanctum;

class IncidenciasOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    private function admin()
    {
        $role = Role::factory()->create(['slug'=>'administrador']);
        return User::factory()->create(['id_rol'=>$role->id_rol]);
    }

    public function test_listado_orden_desc()
    {
        $admin = $this->admin();
        Sanctum::actingAs($admin);
        $fecha = now()->toDateString();
        // Crear incidencias con distintas horas y fechas
        Incidencia::factory()->create(['fecha'=>now()->subDay()->toDateString(),'hora_inicio'=>now()->subDay()->copy()->setTime(8,0),'hora_fin'=>now()->subDay()->copy()->setTime(9,0),'id_usuario'=>$admin->id_usuario,'tipo'=>'otra']);
        Incidencia::factory()->create(['fecha'=>$fecha,'hora_inicio'=>now()->setTime(7,0),'hora_fin'=>now()->setTime(8,0),'id_usuario'=>$admin->id_usuario,'tipo'=>'otra']);
        Incidencia::factory()->create(['fecha'=>$fecha,'hora_inicio'=>now()->setTime(9,0),'hora_fin'=>now()->setTime(10,0),'id_usuario'=>$admin->id_usuario,'tipo'=>'otra']);

        $res = $this->getJson('/api/incidencias');
        $res->assertOk();
        $data = $res->json('data');
        $this->assertCount(3,$data);
        // Esperado: fecha hoy hora 09:00, fecha hoy hora 07:00, fecha ayer
        $this->assertTrue(str_contains($data[0]['hora_inicio'],'09:00'));
        $this->assertTrue(str_contains($data[1]['hora_inicio'],'07:00'));
    }
}
