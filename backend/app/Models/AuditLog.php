<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;
    protected $table = 'audit_logs';
    protected $fillable = [
        'id_usuario','model_type','model_id','action','changes'
    ];
    protected $casts = [
        'changes' => 'array'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class,'id_usuario','id_usuario');
    }
}
