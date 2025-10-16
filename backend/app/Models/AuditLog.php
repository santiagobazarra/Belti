<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_logs';
    protected $fillable = [
        'id_usuario','model_type','model_id','action','changes','old_values','new_values','ip_address','user_agent'
    ];
    protected $casts = [
        'changes' => 'array',
        'old_values' => 'array',
        'new_values' => 'array'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class,'id_usuario','id_usuario');
    }

    // Accessor para limpiar el model_type (eliminar namespace)
    public function getModelTypeAttribute($value)
    {
        if (!$value) return $value;
        
        // Si contiene \ (namespace), extraer solo el nombre de la clase
        if (strpos($value, '\\') !== false) {
            $parts = explode('\\', $value);
            return end($parts);
        }
        
        return $value;
    }
}
