<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Festivo extends Model
{
    use HasFactory;
    protected $table = 'calendario_festivos';
    protected $primaryKey = 'id_festivo';
    protected $fillable = ['fecha','descripcion','tipo'];
    protected $casts = ['fecha'=>'date'];

    public function scopeEntre($q,$desde,$hasta){
        return $q->whereBetween('fecha',[$desde,$hasta]);
    }
}
