<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;

class Pausa extends Model
{
    use HasFactory, Auditable;

    protected $table = 'pausas';
    protected $primaryKey = 'id_pausa';
    protected $fillable = [
        'id_jornada','hora_inicio','hora_fin','duracion','tipo',
        'ip_inicio','ip_fin','hora_inicio_dispositivo','hora_fin_dispositivo','es_computable'
    ];
    protected $casts = [
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
        'hora_inicio_dispositivo' => 'datetime',
        'hora_fin_dispositivo' => 'datetime',
        'duracion' => 'decimal:2',
        'es_computable' => 'boolean'
    ];

    public function jornada()
    {
        return $this->belongsTo(Jornada::class,'id_jornada','id_jornada');
    }
}
