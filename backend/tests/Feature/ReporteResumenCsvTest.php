<?php
namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Carbon\Carbon;

class ReporteResumenCsvTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::factory()->create(['slug' => 'administrador', 'nombre' => 'Administrador']);
    }

    public function test_csv_descarga()
    {
        $admin = User::factory()->create(['password' => Hash::make('password')]);
        $admin->role()->associate(Role::where('slug','administrador')->first());
        $admin->save();

        $fecha = Carbon::now()->startOfDay();
        $admin->jornadas()->create([
            'fecha' => $fecha->toDateString(),
            'hora_entrada' => $fecha->copy()->setTime(8,0,0),
            'hora_salida' => $fecha->copy()->setTime(16,0,0),
            'total_horas' => 8,
            'horas_extra' => 1,
        ]);

        $this->actingAs($admin);
        $resp = $this->get('/api/reportes/resumen.csv?desde='.$fecha->toDateString().'&hasta='.$fecha->toDateString());
        $resp->assertStatus(200);
        $resp->assertHeader('Content-Type','text/csv; charset=UTF-8');
        $this->assertStringContainsString('fecha,usuario,departamento,horas_netas,horas_extra', $resp->getContent());
    }
}
