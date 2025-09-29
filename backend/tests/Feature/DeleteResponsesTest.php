<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Role;
use App\Models\Festivo;
use App\Models\Incidencia;
use App\Models\Solicitud;

class DeleteResponsesTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $empleado;

    protected function setUp(): void
    {
        parent::setUp();
        $roleAdmin = Role::firstOrCreate(['slug'=>'administrador'],['nombre'=>'Administrador']);
        $roleEmp = Role::firstOrCreate(['slug'=>'empleado'],['nombre'=>'Empleado']);
        $this->admin = User::factory()->create(['id_rol'=>$roleAdmin->id_rol]);
        $this->empleado = User::factory()->create(['id_rol'=>$roleEmp->id_rol]);
    }

    public function test_delete_festivo_formato()
    {
        $festivo = Festivo::create(['fecha'=>'2025-12-25','descripcion'=>'Navidad','tipo'=>'nacional']);
        $this->actingAs($this->admin,'sanctum')
            ->deleteJson('/api/festivos/'.$festivo->id_festivo)
            ->assertStatus(200)
            ->assertJsonStructure(['deleted','resource','id','message','timestamp'])
            ->assertJsonFragment(['resource'=>'festivo','id'=>(string)$festivo->id_festivo,'deleted'=>true]);
    }

    public function test_delete_solicitud_formato()
    {
        $sol = Solicitud::create([
            'id_usuario'=>$this->empleado->id_usuario,
            'fecha_inicio'=>'2025-10-01',
            'fecha_fin'=>'2025-10-02',
            'tipo'=>'vacaciones'
        ]);
        $this->actingAs($this->empleado,'sanctum')
            ->deleteJson('/api/solicitudes/'.$sol->id_solicitud)
            ->assertStatus(200)
            ->assertJsonFragment(['resource'=>'solicitud','id'=>(string)$sol->id_solicitud,'deleted'=>true]);
    }

    public function test_delete_incidencia_formato()
    {
        $inc = Incidencia::create([
            'id_usuario'=>$this->empleado->id_usuario,
            'fecha'=>'2025-09-16',
            'tipo'=>'otra',
            'descripcion'=>'Prueba',
            'estado'=>'pendiente'
        ]);
        $this->actingAs($this->empleado,'sanctum')
            ->deleteJson('/api/incidencias/'.$inc->id_incidencia)
            ->assertStatus(200)
            ->assertJsonFragment(['resource'=>'incidencia','id'=>(string)$inc->id_incidencia,'deleted'=>true]);
    }
}
