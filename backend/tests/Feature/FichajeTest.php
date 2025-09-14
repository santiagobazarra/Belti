<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FichajeTest extends TestCase
{
    use RefreshDatabase;

    public function test_iniciar_y_finalizar_jornada()
    {
        config(['fichaje.anti_double_click_seconds' => 0]);
        $user = User::factory()->create();
        $this->actingAs($user);
        $start = $this->postJson('/api/fichaje/jornada');
        $start->assertStatus(200)->assertJsonPath('status','started');
        $end = $this->postJson('/api/fichaje/jornada');
        $end->assertStatus(200)->assertJsonPath('status','ended');
    }

    public function test_no_permite_segunda_jornada_mismo_dia()
    {
        config(['fichaje.permitir_multiples_jornadas_dia' => false,'fichaje.anti_double_click_seconds'=>0]);
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->postJson('/api/fichaje/jornada');
        $this->postJson('/api/fichaje/jornada');
        $resp = $this->postJson('/api/fichaje/jornada');
        $resp->assertStatus(422);
    }

    public function test_pausa_flujo()
    {
        config(['fichaje.anti_double_click_seconds'=>0]);
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->postJson('/api/fichaje/jornada');
        $p1 = $this->postJson('/api/fichaje/pausa');
        $p1->assertStatus(200)->assertJsonPath('status','break_started');
        $p2 = $this->postJson('/api/fichaje/pausa');
        $p2->assertStatus(200)->assertJsonPath('status','break_ended');
    }
}
