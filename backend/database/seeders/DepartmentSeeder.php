<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['nombre' => 'Recursos Humanos', 'descripcion' => 'Gestión del personal'],
            ['nombre' => 'IT', 'descripcion' => 'Tecnología y soporte'],
            ['nombre' => 'Finanzas', 'descripcion' => 'Gestión financiera'],
        ];

        foreach ($items as $data) {
            Department::firstOrCreate(['nombre' => $data['nombre']], $data);
        }
    }
}
