<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('nombre', 'administrador')->first();
        if (!$adminRole) {
            $adminRole = Role::create(['nombre' => 'administrador', 'descripcion' => 'Acceso total']);
        }

        User::firstOrCreate(
            ['email' => 'admin@empresa.test'],
            [
                'nombre' => 'Admin',
                'apellidos' => 'Principal',
                'password' => Hash::make('password'),
                'activo' => true,
                'fecha_alta' => now(),
                'id_rol' => $adminRole->id_rol
            ]
        );
    }
}
