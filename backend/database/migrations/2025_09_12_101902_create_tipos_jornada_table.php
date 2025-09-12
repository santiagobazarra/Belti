<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tipos_jornada', function (Blueprint $table) {
            $table->id('id_tipo_jornada');
            $table->string('nombre');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->decimal('horas_totales', 5, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_jornada');
    }
};
