<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Jornada extends Model
{
    use HasFactory;

    protected $table = 'jornadas';
    protected $primaryKey = 'id_jornada';
    protected $fillable = [
        'id_usuario','fecha','hora_entrada','hora_salida','horas_extra','total_horas','estado'
    ];
    protected $casts = [
        'fecha' => 'date',
        'hora_entrada' => 'datetime',
        'hora_salida' => 'datetime',
        'horas_extra' => 'decimal:2',
        'total_horas' => 'decimal:2'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class,'id_usuario','id_usuario');
    }

    public function pausas()
    {
        return $this->hasMany(Pausa::class,'id_jornada','id_jornada');
    }

    public function scopeDelDia($query, $fecha)
    {
        return $query->whereDate('fecha',$fecha);
    }
}
