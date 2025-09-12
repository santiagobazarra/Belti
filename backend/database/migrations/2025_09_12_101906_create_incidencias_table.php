<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('incidencias', function (Blueprint $table) {
            $table->id('id_incidencia');
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_jornada');
            $table->date('fecha');
            $table->string('tipo');
            $table->text('descripcion')->nullable();
            $table->boolean('justificada')->default(false);
            $table->timestamps();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('id_jornada')->references('id_jornada')->on('jornadas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidencias');
    }
};
