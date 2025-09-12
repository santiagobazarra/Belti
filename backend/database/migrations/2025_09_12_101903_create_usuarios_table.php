<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre');
            $table->string('apellidos');
            $table->string('email')->unique();
            $table->string('password');
            $table->unsignedBigInteger('id_departamento')->nullable();
            $table->unsignedBigInteger('id_tipo_jornada')->nullable();
            $table->boolean('activo')->default(true);
            $table->date('fecha_alta')->nullable();
            $table->date('fecha_baja')->nullable();
            $table->timestamps();

            $table->foreign('id_departamento')->references('id_departamento')->on('departamentos')->onDelete('set null');
            $table->foreign('id_tipo_jornada')->references('id_tipo_jornada')->on('tipos_jornada')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
