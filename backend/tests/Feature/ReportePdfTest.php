<?php
namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ReportePdfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::factory()->create(['slug' => 'administrador','nombre'=>'Administrador']);
    }

    public function test_pdf_descarga()
    {
        $admin = User::factory()->create();
        $admin->role()->associate(Role::where('slug','administrador')->first());
        $admin->save();

        $fecha = Carbon::now()->startOfDay()->toDateString();
        $admin->jornadas()->create([
            'fecha' => $fecha,
            'hora_entrada' => Carbon::now()->setTime(8,0),
            'hora_salida' => Carbon::now()->setTime(16,0),
            'total_horas' => 8,
        ]);

        $this->actingAs($admin);
        $resp = $this->get('/api/reportes/resumen.pdf?desde='.$fecha.'&hasta='.$fecha);
        $resp->assertStatus(200);
        $resp->assertHeader('content-type', 'application/pdf');
        $this->assertTrue(strlen($resp->getContent()) > 100); // algo de contenido
    }
}
