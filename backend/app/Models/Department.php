<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory;

    protected $table = 'departamentos';
    protected $primaryKey = 'id_departamento';
    protected $fillable = ['nombre','descripcion'];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'id_departamento', 'id_departamento');
    }
}
