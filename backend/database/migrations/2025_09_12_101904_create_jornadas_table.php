<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jornadas', function (Blueprint $table) {
            $table->id('id_jornada');
            $table->unsignedBigInteger('id_usuario');
            $table->date('fecha');
            $table->datetime('hora_entrada');
            $table->datetime('hora_salida')->nullable();
            $table->decimal('horas_extra', 5, 2)->nullable();
            $table->decimal('total_horas', 5, 2)->nullable();
            $table->string('estado')->default('pendiente');
            $table->timestamps();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jornadas');
    }
};
