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
        Schema::table('pausas', function (Blueprint $table) {
            // Agregar referencia al tipo de pausa
            $table->foreignId('id_tipo_pausa')->nullable()->after('id_jornada')->constrained('tipos_pausa');

            // Modificar el campo tipo para que sea opcional (se usará el del tipo_pausa)
            $table->string('tipo')->nullable()->change();

            // Agregar campos para el control de computabilidad más granular
            $table->integer('minutos_no_computables')->default(0)->after('es_computable');

            $table->index('id_tipo_pausa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pausas', function (Blueprint $table) {
            $table->dropForeign(['id_tipo_pausa']);
            $table->dropColumn(['id_tipo_pausa', 'minutos_no_computables']);
            $table->string('tipo')->nullable(false)->change();
        });
    }
};
