<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('usuarios') && Schema::hasColumn('usuarios','email')) {
            try { Schema::table('usuarios', function (Blueprint $table) {
                $table->unique('email','usuarios_email_unique');
            }); } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('jornadas')) {
            try { Schema::table('jornadas', function (Blueprint $table) {
                if (Schema::hasColumn('jornadas','id_usuario') && Schema::hasColumn('jornadas','fecha')) {
                    $table->index(['id_usuario','fecha'],'jornadas_usuario_fecha_index');
                }
                if (Schema::hasColumn('jornadas','fecha')) {
                    $table->index('fecha','jornadas_fecha_index');
                }
            }); } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('pausas')) {
            try { Schema::table('pausas', function (Blueprint $table) {
                if (Schema::hasColumn('pausas','id_jornada')) { $table->index('id_jornada','pausas_jornada_index'); }
                if (Schema::hasColumn('pausas','hora_inicio')) { $table->index('hora_inicio','pausas_hora_inicio_index'); }
            }); } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('incidencias')) {
            try { Schema::table('incidencias', function (Blueprint $table) {
                if (Schema::hasColumn('incidencias','id_usuario') && Schema::hasColumn('incidencias','fecha')) {
                    $table->index(['id_usuario','fecha'],'incidencias_usuario_fecha_index');
                }
                if (Schema::hasColumn('incidencias','estado')) { $table->index('estado','incidencias_estado_index'); }
                if (Schema::hasColumn('incidencias','hora_inicio')) { $table->index('hora_inicio','incidencias_hora_inicio_index'); }
            }); } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('solicitudes')) {
            try { Schema::table('solicitudes', function (Blueprint $table) {
                if (Schema::hasColumn('solicitudes','id_usuario') && Schema::hasColumn('solicitudes','fecha_inicio')) {
                    $table->index(['id_usuario','fecha_inicio'],'solicitudes_usuario_fecha_inicio_index');
                }
                if (Schema::hasColumn('solicitudes','estado')) { $table->index('estado','solicitudes_estado_index'); }
            }); } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('calendario_festivos') && Schema::hasColumn('calendario_festivos','fecha')) {
            try { Schema::table('calendario_festivos', function (Blueprint $table) {
                $table->unique('fecha','calendario_festivos_fecha_unique');
            }); } catch (\Throwable $e) {}
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('usuarios')) {
            try { Schema::table('usuarios', function (Blueprint $table) { $table->dropUnique('usuarios_email_unique'); }); } catch (\Throwable $e) {}
        }
        if (Schema::hasTable('jornadas')) {
            try { Schema::table('jornadas', function (Blueprint $table) {
                $table->dropIndex('jornadas_usuario_fecha_index');
                $table->dropIndex('jornadas_fecha_index');
            }); } catch (\Throwable $e) {}
        }
        if (Schema::hasTable('pausas')) {
            try { Schema::table('pausas', function (Blueprint $table) {
                $table->dropIndex('pausas_jornada_index');
                $table->dropIndex('pausas_hora_inicio_index');
            }); } catch (\Throwable $e) {}
        }
        if (Schema::hasTable('incidencias')) {
            try { Schema::table('incidencias', function (Blueprint $table) {
                $table->dropIndex('incidencias_usuario_fecha_index');
                $table->dropIndex('incidencias_estado_index');
                $table->dropIndex('incidencias_hora_inicio_index');
            }); } catch (\Throwable $e) {}
        }
        if (Schema::hasTable('solicitudes')) {
            try { Schema::table('solicitudes', function (Blueprint $table) {
                $table->dropIndex('solicitudes_usuario_fecha_inicio_index');
                $table->dropIndex('solicitudes_estado_index');
            }); } catch (\Throwable $e) {}
        }
        if (Schema::hasTable('calendario_festivos')) {
            try { Schema::table('calendario_festivos', function (Blueprint $table) { $table->dropUnique('calendario_festivos_fecha_unique'); }); } catch (\Throwable $e) {}
        }
    }
};
