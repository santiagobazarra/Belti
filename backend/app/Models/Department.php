<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;

class Department extends Model
{
    use HasFactory, Auditable;

    protected $table = 'departamentos';
    protected $primaryKey = 'id_departamento';
    protected $fillable = ['nombre','descripcion','color','icono'];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'id_departamento', 'id_departamento');
    }
}
