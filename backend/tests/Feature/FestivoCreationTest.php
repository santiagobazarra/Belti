<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Laravel\Sanctum\Sanctum;

class FestivoCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    private function admin()
    {
        $role = Role::factory()->create(['slug'=>'administrador']);
        return User::factory()->create(['id_rol'=>$role->id_rol]);
    }

    public function test_validacion_campos_faltantes()
    {
        Sanctum::actingAs($this->admin());
        $resp = $this->postJson('/api/festivos',[]);
        $resp->assertStatus(422)->assertJsonPath('error.code','VALIDATION_ERROR');
    }

    public function test_crea_festivo_ok()
    {
        Sanctum::actingAs($this->admin());
        $resp = $this->postJson('/api/festivos',[
            'fecha'=>'2025-12-25',
            'descripcion'=>'Navidad',
            'tipo'=>'nacional'
        ]);
        $resp->assertStatus(201)->assertJsonPath('descripcion','Navidad');
    }
}
