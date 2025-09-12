<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pausa extends Model
{
    use HasFactory;

    protected $table = 'pausas';
    protected $primaryKey = 'id_pausa';
    protected $fillable = [
        'id_jornada','hora_inicio','hora_fin','duracion','tipo'
    ];
    protected $casts = [
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
        'duracion' => 'decimal:2'
    ];

    public function jornada()
    {
        return $this->belongsTo(Jornada::class,'id_jornada','id_jornada');
    }
}
