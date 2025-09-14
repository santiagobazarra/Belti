<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Solicitud extends Model
{
    use HasFactory, Auditable;

    protected $table = 'solicitudes';
    protected $primaryKey = 'id_solicitud';

    protected $fillable = [
        'id_usuario','fecha_inicio','fecha_fin','tipo','motivo','estado','id_aprobador','fecha_resolucion','comentario_resolucion'
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'fecha_resolucion' => 'datetime'
    ];

    public function usuario() { return $this->belongsTo(User::class,'id_usuario','id_usuario'); }
    public function aprobador() { return $this->belongsTo(User::class,'id_aprobador','id_usuario'); }

    public function scopeFiltro($q,$f) {
        if(isset($f['estado'])) $q->where('estado',$f['estado']);
        if(isset($f['tipo'])) $q->where('tipo',$f['tipo']);
        if(isset($f['desde'])) $q->whereDate('fecha_inicio','>=',$f['desde']);
        if(isset($f['hasta'])) $q->whereDate('fecha_fin','<=',$f['hasta']);
        return $q;
    }
}
