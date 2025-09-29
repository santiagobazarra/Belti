<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;

class DepartmentAuthorizationTest extends TestCase
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

    public function test_empleado_no_puede_crear_departamento()
    {
        $this->actingAs($this->empleado,'sanctum')
            ->postJson('/api/departamentos',[ 'nombre'=>'Finanzas' ])
            ->assertStatus(403);
    }

    public function test_admin_crea_actualiza_y_elimina()
    {
        // Crear
        $resp = $this->actingAs($this->admin,'sanctum')
            ->postJson('/api/departamentos',[ 'nombre'=>'Finanzas','descripcion'=>'Desc'])
            ->assertStatus(201)
            ->json();
        $id = $resp['id_departamento'];

        // Update
        $this->actingAs($this->admin,'sanctum')
            ->putJson("/api/departamentos/$id",['descripcion'=>'Actualizada'])
            ->assertStatus(200)
            ->assertJsonFragment(['descripcion'=>'Actualizada']);

        // Delete
        $this->actingAs($this->admin,'sanctum')
            ->deleteJson("/api/departamentos/$id")
            ->assertStatus(200)
            ->assertJsonFragment(['message'=>'Departamento eliminado']);
    }

    public function test_empleado_no_puede_actualizar_o_eliminar()
    {
        $dept = Department::create(['nombre'=>'RRHH']);
        $this->actingAs($this->empleado,'sanctum')
            ->putJson('/api/departamentos/'.$dept->id_departamento,['descripcion'=>'X'])
            ->assertStatus(403);
        $this->actingAs($this->empleado,'sanctum')
            ->deleteJson('/api/departamentos/'.$dept->id_departamento)
            ->assertStatus(403);
    }
}
