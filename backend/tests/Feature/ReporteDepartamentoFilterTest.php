<?php
namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ReporteDepartamentoFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::factory()->create(['slug' => 'administrador','nombre'=>'Administrador']);
    }

    public function test_filtrar_por_departamento()
    {
        $admin = User::factory()->create();
        $admin->role()->associate(Role::where('slug','administrador')->first());
        $admin->save();

        $depA = Department::create(['nombre'=>'Depto A']);
        $depB = Department::create(['nombre'=>'Depto B']);

        $u1 = User::factory()->create();
        $u1->role()->associate(Role::where('slug','administrador')->first());
        $u1->id_departamento = $depA->id_departamento; $u1->save();
        $u2 = User::factory()->create();
        $u2->role()->associate(Role::where('slug','administrador')->first());
        $u2->id_departamento = $depB->id_departamento; $u2->save();

        $fecha = Carbon::now()->startOfDay()->toDateString();
        $u1->jornadas()->create(['fecha'=>$fecha,'hora_entrada'=>Carbon::now()->setTime(8,0),'hora_salida'=>Carbon::now()->setTime(16,0),'total_horas'=>8]);
        $u2->jornadas()->create(['fecha'=>$fecha,'hora_entrada'=>Carbon::now()->setTime(9,0),'hora_salida'=>Carbon::now()->setTime(17,0),'total_horas'=>8]);

        $this->actingAs($admin);
        $resp = $this->getJson('/api/reportes/resumen?desde='.$fecha.'&hasta='.$fecha.'&id_departamento='.$depA->id_departamento);
        $resp->assertStatus(200);
        $json = $resp->json();
        $this->assertEquals(8, $json['totales']['horas_netas']);
        $this->assertCount(1, $json['detalle']);
    }
}
