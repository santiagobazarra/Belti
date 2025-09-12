<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pausas', function (Blueprint $table) {
            $table->id('id_pausa');
            $table->unsignedBigInteger('id_jornada');
            $table->datetime('hora_inicio');
            $table->datetime('hora_fin')->nullable();
            $table->decimal('duracion', 5, 2)->nullable();
            $table->string('tipo');
            $table->timestamps();

            $table->foreign('id_jornada')->references('id_jornada')->on('jornadas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pausas');
    }
};
