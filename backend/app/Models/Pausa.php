<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\Auditable;

class Pausa extends Model
{
    use HasFactory, Auditable;

    protected $table = 'pausas';
    protected $primaryKey = 'id_pausa';
    protected $fillable = [
        'id_jornada',
        'id_tipo_pausa',
        'hora_inicio',
        'hora_fin',
        'duracion',
        'tipo',
        'ip_inicio',
        'ip_fin',
        'hora_inicio_dispositivo',
        'hora_fin_dispositivo',
        'es_computable',
        'minutos_no_computables'
    ];
    protected $casts = [
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
        'hora_inicio_dispositivo' => 'datetime',
        'hora_fin_dispositivo' => 'datetime',
        'duracion' => 'decimal:2',
        'es_computable' => 'boolean',
        'minutos_no_computables' => 'integer'
    ];

    public function jornada(): BelongsTo
    {
        return $this->belongsTo(Jornada::class,'id_jornada','id_jornada');
    }

    public function tipoPausa(): BelongsTo
    {
        return $this->belongsTo(TipoPausa::class, 'id_tipo_pausa');
    }

    /**
     * Obtener el nombre del tipo de pausa
     */
    public function getNombreTipoAttribute(): string
    {
        return $this->tipoPausa?->nombre ?? $this->tipo ?? 'Sin tipo';
    }

    /**
     * Calcular los minutos realmente computables
     */
    public function getMinutosComputablesAttribute(): int
    {
        $totalMinutos = (int) ($this->duracion * 60);
        return $totalMinutos - ($this->minutos_no_computables ?? 0);
    }
}
