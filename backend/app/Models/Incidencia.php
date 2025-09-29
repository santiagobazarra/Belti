<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Incidencia extends Model
{
    use HasFactory, Auditable;

    protected $table = 'incidencias';
    protected $primaryKey = 'id_incidencia';

    protected $fillable = [
        'id_usuario','fecha','hora_inicio','hora_fin','tipo','descripcion','estado','id_revisor','fecha_revision','comentario_revision'
    ];

    protected $casts = [
        'fecha' => 'date',
        'fecha_revision' => 'datetime',
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime'
    ];

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d\TH:i:s.u\Z');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class,'id_usuario','id_usuario');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class,'id_revisor','id_usuario');
    }

    public function scopeFiltroBasico($q,$filtro)
    {
        if(isset($filtro['estado'])) $q->where('estado',$filtro['estado']);
        if(isset($filtro['tipo'])) $q->where('tipo',$filtro['tipo']);
        if(isset($filtro['desde'])) $q->whereDate('fecha','>=',$filtro['desde']);
        if(isset($filtro['hasta'])) $q->whereDate('fecha','<=',$filtro['hasta']);
        return $q;
    }
}
