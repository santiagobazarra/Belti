<?php
namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->jobTitle(),
            'descripcion' => $this->faker->sentence(),
            'slug' => $this->faker->unique()->slug(2),
        ];
    }
}
