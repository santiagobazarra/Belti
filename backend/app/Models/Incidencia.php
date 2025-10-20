<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use App\Traits\Auditable;
use App\Traits\AuditActions;

class Incidencia extends Model
{
    use HasFactory, Auditable, AuditActions;

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

    /**
     * Aprobar incidencia y registrar en auditoría
     */
    public function aprobar($comentario = null)
    {
        $this->estado = 'resuelta';
        $this->id_revisor = Auth::id();
        $this->fecha_revision = now();
        $this->comentario_revision = $comentario;
        $this->save();

        // Registrar en auditoría
        $this->auditApproval('incidencia', $comentario);
    }

    /**
     * Rechazar incidencia y registrar en auditoría
     */
    public function rechazar($comentario = null)
    {
        $this->estado = 'rechazada';
        $this->id_revisor = Auth::id();
        $this->fecha_revision = now();
        $this->comentario_revision = $comentario;
        $this->save();

        // Registrar en auditoría
        $this->auditRejection('incidencia', $comentario);
    }
}
