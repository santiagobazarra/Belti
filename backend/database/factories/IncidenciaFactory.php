<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Incidencia;
use App\Models\User;

class IncidenciaFactory extends Factory
{
    protected $model = Incidencia::class;

    public function definition(): array
    {
        return [
            'id_usuario' => User::factory(),
            'fecha' => $this->faker->date(),
            'tipo' => $this->faker->randomElement(['falta','retraso','ausencia_parcial','anomalia_horas','otra']),
            'descripcion' => $this->faker->sentence(),
            'estado' => 'pendiente'
        ];
    }
}
