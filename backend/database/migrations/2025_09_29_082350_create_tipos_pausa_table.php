<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tipos_pausa', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: "Descanso", "Comida", "Fumar", etc.
            $table->text('descripcion')->nullable();
            $table->boolean('es_computable')->default(true); // Si computa en la jornada o no
            $table->integer('minutos_computable_maximo')->nullable(); // Máx. minutos que computan
            $table->integer('max_usos_dia')->nullable(); // Máximo usos por día para ser computable
            $table->boolean('activo')->default(true);
            $table->integer('orden')->default(0); // Para ordenar en el selector
            $table->timestamps();

            $table->index(['activo', 'orden']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipos_pausa');
    }
};
