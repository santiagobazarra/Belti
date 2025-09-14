<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Jornada;
use Carbon\Carbon;

class CloseOpenJornadasCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_cierra_jornada_abierta_dia_anterior()
    {
        Role::factory()->create(['slug'=>'empleado','nombre'=>'Empleado']);
        $user = User::factory()->create();
        $user->role()->associate(Role::where('slug','empleado')->first());
        $user->save();
        $fechaAyer = Carbon::yesterday();
        $entrada = $fechaAyer->copy()->setTime(9,0);
        $j = Jornada::create([
            'id_usuario'=>$user->id_usuario,
            'fecha'=>$fechaAyer->toDateString(),
            'hora_entrada'=>$entrada,
            'total_horas'=>0,
        ]);

        $this->artisan('jornadas:cerrar-abiertas')
            ->assertExitCode(0)
            ->expectsOutputToContain('Encontradas 1 jornadas abiertas.');

        $j->refresh();
        $this->assertNotNull($j->hora_salida);
        $this->assertEquals('23:59:00',$j->hora_salida->format('H:i:s'));
        $this->assertTrue($j->total_horas > 0);
    }
}
