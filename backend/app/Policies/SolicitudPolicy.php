<?php
namespace App\Policies;

use App\Models\User;
use App\Models\Solicitud;

class SolicitudPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Solicitud $s): bool
    {
        return $user->role?->slug === 'administrador' || $s->id_usuario === $user->id_usuario;
    }

    public function create(User $user): bool
    {
        return true; // cualquier empleado
    }

    public function update(User $user, Solicitud $s): bool
    {
        if ($user->role?->slug === 'administrador') return true;
        return $s->id_usuario === $user->id_usuario && $s->estado === 'pendiente';
    }

    public function delete(User $user, Solicitud $s): bool
    {
        if ($user->role?->slug === 'administrador') return true;
        return $s->id_usuario === $user->id_usuario && $s->estado === 'pendiente';
    }
}
