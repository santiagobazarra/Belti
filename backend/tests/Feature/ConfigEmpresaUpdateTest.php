<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;

class ConfigEmpresaUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        // Crear rol administrador y usuario asociado
        $role = Role::firstOrCreate(['slug'=>'administrador'],[
            'nombre'=>'Administrador','descripcion'=>'Super usuario'
        ]);
        $this->admin = User::factory()->create([
            'id_rol' => $role->id_rol,
        ]);
    }

    public function test_actualiza_zona_horaria_y_persistencia()
    {
        $payload = [
            'zona_horaria' => 'Europe/Madrid',
            'horas_jornada_estandar' => 7.5,
        ];

        $res = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/configuracion', $payload)
            ->assertStatus(200)
            ->assertJsonFragment([
                'zona_horaria' => 'Europe/Madrid',
                'horas_jornada_estandar' => '7.5',
            ]);

        // GET debe reflejar los valores.
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/configuracion')
            ->assertStatus(200)
            ->assertJsonFragment([
                'zona_horaria' => 'Europe/Madrid',
                'horas_jornada_estandar' => '7.5',
            ]);
    }
}
