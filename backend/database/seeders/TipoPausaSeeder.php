<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoPausa;

class TipoPausaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiposPausa = [
            [
                'nombre' => 'Descanso corto',
                'descripcion' => 'Pausa corta para descanso (máximo 15 minutos computables)',
                'es_computable' => true,
                'minutos_computable_maximo' => 15,
                'max_usos_dia' => 2,
                'orden' => 1,
            ],
            [
                'nombre' => 'Comida',
                'descripcion' => 'Pausa para almorzar o cenar (no computable)',
                'es_computable' => false,
                'minutos_computable_maximo' => null,
                'max_usos_dia' => 1,
                'orden' => 2,
            ],
            [
                'nombre' => 'Fumar',
                'descripcion' => 'Pausa para fumar (máximo 10 minutos computables)',
                'es_computable' => true,
                'minutos_computable_maximo' => 10,
                'max_usos_dia' => 3,
                'orden' => 3,
            ],
            [
                'nombre' => 'Necesidades personales',
                'descripcion' => 'Pausa para asuntos personales urgentes',
                'es_computable' => true,
                'minutos_computable_maximo' => 10,
                'max_usos_dia' => 2,
                'orden' => 4,
            ],
            [
                'nombre' => 'Médica',
                'descripcion' => 'Pausa por motivos médicos o de salud',
                'es_computable' => true,
                'minutos_computable_maximo' => null,
                'max_usos_dia' => null,
                'orden' => 5,
            ],
            [
                'nombre' => 'Llamada telefónica',
                'descripcion' => 'Pausa para atender llamadas personales (máximo 5 minutos)',
                'es_computable' => true,
                'minutos_computable_maximo' => 5,
                'max_usos_dia' => 2,
                'orden' => 6,
            ]
        ];

        foreach ($tiposPausa as $tipo) {
            TipoPausa::updateOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }
    }
}
