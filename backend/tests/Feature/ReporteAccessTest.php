<?php
namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ReporteAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::factory()->create(['slug' => 'empleado','nombre'=>'Empleado']);
    }

    public function test_empleado_no_puede_ver_otro_usuario()
    {
        $empleado1 = User::factory()->create();
        $empleado1->role()->associate(Role::where('slug','empleado')->first());
        $empleado1->save();
        $empleado2 = User::factory()->create();
        $empleado2->role()->associate(Role::where('slug','empleado')->first());
        $empleado2->save();

        $fecha = Carbon::now()->startOfDay()->toDateString();
        $empleado2->jornadas()->create([
            'fecha' => $fecha,
            'hora_entrada' => Carbon::now()->setTime(8,0),
            'hora_salida' => Carbon::now()->setTime(16,0),
            'total_horas' => 8,
        ]);

        $this->actingAs($empleado1);
        $resp = $this->getJson('/api/reportes/resumen?desde='.$fecha.'&hasta='.$fecha.'&id_usuario='.$empleado2->id_usuario);
        $resp->assertStatus(200);
        $json = $resp->json();
        $this->assertEquals(0, $json['totales']['horas_netas']);
    }
}
