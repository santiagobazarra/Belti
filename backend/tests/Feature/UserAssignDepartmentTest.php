<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;

class UserAssignDepartmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $empleado;
    protected Department $dept;

    protected function setUp(): void
    {
        parent::setUp();
        $roleAdmin = Role::firstOrCreate(['slug'=>'administrador'],['nombre'=>'Administrador']);
        $roleEmp = Role::firstOrCreate(['slug'=>'empleado'],['nombre'=>'Empleado']);
        $this->admin = User::factory()->create(['id_rol'=>$roleAdmin->id_rol]);
        $this->empleado = User::factory()->create(['id_rol'=>$roleEmp->id_rol]);
        $this->dept = Department::create(['nombre'=>'IT']);
    }

    public function test_admin_asigna_departamento()
    {
        $this->actingAs($this->admin,'sanctum')
            ->postJson('/api/usuarios/'.$this->empleado->id_usuario.'/departamento',[ 'id_departamento'=>$this->dept->id_departamento ])
            ->assertStatus(200)
            ->assertJsonFragment(['id_departamento'=>$this->dept->id_departamento]);
    }

    public function test_empleado_no_puede_asignar_departamento()
    {
        $anotherUser = User::factory()->create(['id_rol'=>$this->empleado->id_rol]);
        $this->actingAs($this->empleado,'sanctum')
            ->postJson('/api/usuarios/'.$anotherUser->id_usuario.'/departamento',[ 'id_departamento'=>$this->dept->id_departamento ])
            ->assertStatus(403);
    }

    public function test_validacion_departamento_invalido()
    {
        $this->actingAs($this->admin,'sanctum')
            ->postJson('/api/usuarios/'.$this->empleado->id_usuario.'/departamento',[ 'id_departamento'=>9999 ])
            ->assertStatus(422);
    }
}
