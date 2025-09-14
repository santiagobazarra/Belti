<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Carbon\Carbon;

class ReporteResumenTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Crear roles básicos
        Role::factory()->create(['slug' => 'administrador', 'nombre' => 'Administrador']);
        Role::factory()->create(['slug' => 'empleado', 'nombre' => 'Empleado']);
    }

    public function test_resumen_reportes_admin()
    {
        $admin = User::factory()->create(['password' => Hash::make('password')]);
        $admin->role()->associate(Role::where('slug','administrador')->first());
        $admin->save();

        $empleado = User::factory()->create();
        $empleado->role()->associate(Role::where('slug','empleado')->first());
        $empleado->save();

        // Crear jornadas + pausas
        $fecha = Carbon::now()->startOfDay();
        $empleado->jornadas()->create([
            'fecha' => $fecha->toDateString(),
            'hora_entrada' => $fecha->copy()->setTime(8,0,0),
            'hora_salida' => $fecha->copy()->setTime(16,0,0),
            'total_horas' => 8,
            'horas_extra' => 1,
        ]);

        $this->actingAs($admin);
        $resp = $this->getJson('/api/reportes/resumen?desde='.$fecha->toDateString().'&hasta='.$fecha->toDateString());
        $resp->assertStatus(200)
            ->assertJsonStructure([
                'totales' => ['horas_netas','horas_extra','pausas_no_computables_horas','pausas_computables_horas','dias_trabajados','horas_jornada_estandar','horas_deficit'],
                'detalle'
            ]);
    }
}
