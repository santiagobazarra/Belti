<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;

class ConfigEmpresa extends Model
{
    use HasFactory, Auditable;
    protected $table = 'configuracion_empresa';
    protected $primaryKey = 'id_config';
    protected $fillable = ['clave','valor'];
}
