<?php
namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Incidencia;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class AuditIncidenciaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::factory()->create(['slug'=>'empleado','nombre'=>'Empleado']);
    }

    public function test_crear_y_actualizar_incidencia_generan_logs()
    {
        $user = User::factory()->create();
        $user->role()->associate(Role::where('slug','empleado')->first());
        $user->save();
        $this->actingAs($user);

        $fecha = Carbon::now()->toDateString();
        $resp = $this->postJson('/api/incidencias',["fecha"=>$fecha,"tipo"=>'falta','descripcion'=>'Desc']);
        $resp->assertStatus(201);
        $incId = $resp->json('id_incidencia');

        $this->putJson('/api/incidencias/'.$incId,['descripcion'=>'Modificada','tipo'=>'falta','fecha'=>$fecha])->assertStatus(200);

        $logs = AuditLog::where('model_type',Incidencia::class)->where('model_id',$incId)->get();
        $this->assertCount(2,$logs); // created + updated
        $this->assertEquals('created',$logs->first()->action);
        $this->assertEquals('updated',$logs->last()->action);
    }
}
