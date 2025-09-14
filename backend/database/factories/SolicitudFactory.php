<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Solicitud;
use App\Models\User;

class SolicitudFactory extends Factory
{
    protected $model = Solicitud::class;

    public function definition(): array
    {
        $inicio = $this->faker->dateTimeBetween('-1 month','now');
        return [
            'id_usuario' => User::factory(),
            'fecha_inicio' => $inicio->format('Y-m-d'),
            'fecha_fin' => (clone $inicio)->modify('+'.rand(0,5).' day')->format('Y-m-d'),
            'tipo' => $this->faker->randomElement(['vacaciones','permiso','baja_medica','otro']),
            'motivo' => $this->faker->sentence(),
            'estado' => 'pendiente'
        ];
    }
}
