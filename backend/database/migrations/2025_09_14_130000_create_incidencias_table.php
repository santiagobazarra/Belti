<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('incidencias')) {
            return;
        }
        Schema::create('incidencias', function (Blueprint $table) {
            $table->id('id_incidencia');
            $table->unsignedBigInteger('id_usuario');
            $table->date('fecha');
            $table->enum('tipo', ['falta','retraso','ausencia_parcial','anomalia_horas','otra']);
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente','revisada','resuelta','rechazada'])->default('pendiente');
            $table->unsignedBigInteger('id_revisor')->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->text('comentario_revision')->nullable();
            $table->timestamps();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->cascadeOnDelete();
            $table->foreign('id_revisor')->references('id_usuario')->on('usuarios')->nullOnDelete();
            $table->index(['fecha','estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidencias');
    }
};
