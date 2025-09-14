<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Incidencia;

class IncidenciaPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // listado filtrado luego si no admin
    }

    public function view(User $user, Incidencia $inc): bool
    {
        return $user->role?->slug === 'administrador' || $inc->id_usuario === $user->id_usuario;
    }

    public function create(User $user): bool
    {
        return true; // cualquier empleado crea su incidencia
    }

    public function update(User $user, Incidencia $inc): bool
    {
        if ($user->role?->slug === 'administrador') return true;
        // Solo autor y si sigue pendiente
        return $inc->id_usuario === $user->id_usuario && $inc->estado === 'pendiente';
    }

    public function delete(User $user, Incidencia $inc): bool
    {
        if ($user->role?->slug === 'administrador') return true;
        return $inc->id_usuario === $user->id_usuario && $inc->estado === 'pendiente';
    }
}
