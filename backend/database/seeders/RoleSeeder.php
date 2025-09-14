<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['nombre' => 'administrador', 'slug' => 'administrador', 'descripcion' => 'Acceso total al sistema'],
            ['nombre' => 'empleado', 'slug' => 'empleado', 'descripcion' => 'Acceso básico para registrar jornadas y solicitudes'],
        ];

        foreach ($roles as $data) {
            Role::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
