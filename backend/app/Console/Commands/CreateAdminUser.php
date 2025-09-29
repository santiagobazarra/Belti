<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    protected $signature = 'app:create-admin {email?} {--password=}';
    protected $description = 'Crea un usuario administrador (si no existe rol lo genera)';

    public function handle(): int
    {
        $email = $this->argument('email') ?? $this->ask('Email del admin');
        $password = $this->option('password') ?? $this->secret('Password (dejar vacío para generar)');
        if(!$password){
            $password = bin2hex(random_bytes(4));
            $this->info('Password generado: '.$password);
        }
        $role = Role::firstOrCreate(['slug'=>'administrador'],[
            'nombre'=>'Administrador',
            'descripcion'=>'Super usuario'
        ]);
        $user = User::firstOrCreate(['email'=>$email],[
            'nombre'=>'Admin',
            'apellidos'=>'System',
            'password'=>Hash::make($password),
            'id_rol'=>$role->id_rol,
            'activo'=>true,
            'fecha_alta'=>now()->toDateString()
        ]);
        if($user->id_rol !== $role->id_rol){
            $user->id_rol = $role->id_rol; $user->save();
        }
        $this->info('Usuario admin listo: '.$user->email);
        return self::SUCCESS;
    }
}
