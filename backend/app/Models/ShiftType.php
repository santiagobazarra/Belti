<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShiftType extends Model
{
    use HasFactory;

    protected $table = 'tipos_jornada';
    protected $primaryKey = 'id_tipo_jornada';
    protected $fillable = ['nombre','hora_inicio','hora_fin','horas_totales'];

    public function usuarios()
    {
        return $this->hasMany(User::class,'id_tipo_jornada','id_tipo_jornada');
    }
}
