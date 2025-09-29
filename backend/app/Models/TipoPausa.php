<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoPausa extends Model
{
    protected $table = 'tipos_pausa';

    protected $fillable = [
        'nombre',
        'descripcion',
        'es_computable',
        'minutos_computable_maximo',
        'max_usos_dia',
        'activo',
        'orden'
    ];

    protected $casts = [
        'es_computable' => 'boolean',
        'activo' => 'boolean',
        'minutos_computable_maximo' => 'integer',
        'max_usos_dia' => 'integer',
        'orden' => 'integer'
    ];

    public function pausas(): HasMany
    {
        return $this->hasMany(Pausa::class, 'id_tipo_pausa');
    }

    /**
     * Calcular si una pausa debe ser computable según las reglas del tipo
     */
    public function calcularComputabilidad(int $duracionMinutos, int $usosHoyDelTipo): array
    {
        $esComputable = $this->es_computable;
        $minutosNoComputables = 0;

        // Si el tipo no es computable por defecto, toda la pausa no computa
        if (!$esComputable) {
            return [
                'es_computable' => false,
                'minutos_no_computables' => $duracionMinutos
            ];
        }

        // Verificar límite de usos por día
        if ($this->max_usos_dia && $usosHoyDelTipo >= $this->max_usos_dia) {
            return [
                'es_computable' => false,
                'minutos_no_computables' => $duracionMinutos
            ];
        }

        // Verificar límite de minutos computables
        if ($this->minutos_computable_maximo && $duracionMinutos > $this->minutos_computable_maximo) {
            $minutosNoComputables = $duracionMinutos - $this->minutos_computable_maximo;
        }

        return [
            'es_computable' => $minutosNoComputables < $duracionMinutos,
            'minutos_no_computables' => $minutosNoComputables
        ];
    }

    /**
     * Scope para tipos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para ordenar por orden
     */
    public function scopeOrdenados($query)
    {
        return $query->orderBy('orden')->orderBy('nombre');
    }
}
