<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // usuarios.departamento_id -> departamentos.id_departamento (restrict)
        if (Schema::hasTable('usuarios') && Schema::hasTable('departamentos')) {
            try {
                Schema::table('usuarios', function (Blueprint $table) {
                    if (Schema::hasColumn('usuarios','departamento_id') && Schema::hasColumn('departamentos','id_departamento')) {
                        $table->foreign('departamento_id', 'usuarios_departamento_fk')
                              ->references('id_departamento')->on('departamentos')
                              ->onUpdate('cascade')->onDelete('restrict');
                    }
                });
            } catch (\Throwable $e) {}
        }

        // jornadas.id_usuario -> usuarios.id_usuario (restrict)
        if (Schema::hasTable('jornadas') && Schema::hasTable('usuarios')) {
            try {
                Schema::table('jornadas', function (Blueprint $table) {
                    if (Schema::hasColumn('jornadas','id_usuario') && Schema::hasColumn('usuarios','id_usuario')) {
                        $table->foreign('id_usuario', 'jornadas_usuario_fk')
                              ->references('id_usuario')->on('usuarios')
                              ->onUpdate('cascade')->onDelete('restrict');
                    }
                });
            } catch (\Throwable $e) {}
        }

        // pausas.id_jornada -> jornadas.id_jornada (cascade)
        if (Schema::hasTable('pausas') && Schema::hasTable('jornadas')) {
            try {
                Schema::table('pausas', function (Blueprint $table) {
                    if (Schema::hasColumn('pausas','id_jornada') && Schema::hasColumn('jornadas','id_jornada')) {
                        $table->foreign('id_jornada', 'pausas_jornada_fk')
                              ->references('id_jornada')->on('jornadas')
                              ->onUpdate('cascade')->onDelete('cascade');
                    }
                });
            } catch (\Throwable $e) {}
        }

        // incidencias.id_usuario -> usuarios.id_usuario (restrict)
        if (Schema::hasTable('incidencias') && Schema::hasTable('usuarios')) {
            try {
                Schema::table('incidencias', function (Blueprint $table) {
                    if (Schema::hasColumn('incidencias','id_usuario') && Schema::hasColumn('usuarios','id_usuario')) {
                        $table->foreign('id_usuario', 'incidencias_usuario_fk')
                              ->references('id_usuario')->on('usuarios')
                              ->onUpdate('cascade')->onDelete('restrict');
                    }
                });
            } catch (\Throwable $e) {}
        }

        // incidencias.id_jornada -> jornadas.id_jornada (set null)
        if (Schema::hasTable('incidencias') && Schema::hasTable('jornadas')) {
            try {
                Schema::table('incidencias', function (Blueprint $table) {
                    if (Schema::hasColumn('incidencias','id_jornada') && Schema::hasColumn('jornadas','id_jornada')) {
                        $table->foreign('id_jornada', 'incidencias_jornada_fk')
                              ->references('id_jornada')->on('jornadas')
                              ->onUpdate('cascade')->onDelete('set null');
                    }
                });
            } catch (\Throwable $e) {}
        }

        // solicitudes.id_usuario -> usuarios.id_usuario (restrict)
        if (Schema::hasTable('solicitudes') && Schema::hasTable('usuarios')) {
            try {
                Schema::table('solicitudes', function (Blueprint $table) {
                    if (Schema::hasColumn('solicitudes','id_usuario') && Schema::hasColumn('usuarios','id_usuario')) {
                        $table->foreign('id_usuario', 'solicitudes_usuario_fk')
                              ->references('id_usuario')->on('usuarios')
                              ->onUpdate('cascade')->onDelete('restrict');
                    }
                });
            } catch (\Throwable $e) {}
        }
    }

    public function down(): void
    {
        $drop = function(string $table, string $key) {
            if (!Schema::hasTable($table)) return;
            try { Schema::table($table, function (Blueprint $t) use ($key) { $t->dropForeign($key); }); } catch (\Throwable $e) {}
        };
        $drop('usuarios','usuarios_departamento_fk');
        $drop('jornadas','jornadas_usuario_fk');
        $drop('pausas','pausas_jornada_fk');
        $drop('incidencias','incidencias_usuario_fk');
        $drop('incidencias','incidencias_jornada_fk');
        $drop('solicitudes','solicitudes_usuario_fk');
    }
};
