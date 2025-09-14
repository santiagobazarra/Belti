<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('solicitudes')) return;
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->unsignedBigInteger('id_usuario');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('tipo', ['vacaciones','permiso','baja_medica','otro']);
            $table->text('motivo')->nullable();
            $table->enum('estado', ['pendiente','aprobada','rechazada','cancelada'])->default('pendiente');
            $table->unsignedBigInteger('id_aprobador')->nullable();
            $table->timestamp('fecha_resolucion')->nullable();
            $table->text('comentario_resolucion')->nullable();
            $table->timestamps();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->cascadeOnDelete();
            $table->foreign('id_aprobador')->references('id_usuario')->on('usuarios')->nullOnDelete();
            $table->index(['fecha_inicio','fecha_fin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes');
    }
};
