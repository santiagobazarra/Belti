<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Auditable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $table = 'usuarios';

    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'nombre',
        'apellidos',
        'email',
        'password',
        'id_departamento',
        'id_tipo_jornada',
        'id_rol',
        'activo',
        'fecha_alta',
        'fecha_baja'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_alta' => 'date',
            'fecha_baja' => 'date',
            'password' => 'hashed',
            'activo' => 'boolean'
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_rol', 'id_rol');
    }

    public function departamento()
    {
        return $this->belongsTo(Department::class, 'id_departamento', 'id_departamento');
    }

    public function jornadas()
    {
        return $this->hasMany(Jornada::class, 'id_usuario', 'id_usuario');
    }

    public function tipoJornada()
    {
        return $this->belongsTo(ShiftType::class, 'id_tipo_jornada', 'id_tipo_jornada');
    }
}
