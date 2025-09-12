<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->unsignedBigInteger('id_usuario');
            $table->string('tipo');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('estado')->default('pendiente');
            $table->text('motivo')->nullable();
            $table->unsignedBigInteger('id_usuario_aprobador')->nullable();
            $table->timestamps();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->foreign('id_usuario_aprobador')->references('id_usuario')->on('usuarios')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes');
    }
};
