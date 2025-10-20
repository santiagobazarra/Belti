<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;

class Role extends Model
{
    use HasFactory, Auditable;

    protected $table = 'roles';
    protected $primaryKey = 'id_rol';
    protected $fillable = ['nombre', 'descripcion', 'slug'];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'id_rol', 'id_rol');
    }
}
