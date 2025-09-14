<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('jornadas', function (Blueprint $table) {
            if (!Schema::hasColumn('jornadas','ip_entrada')) {
                $table->string('ip_entrada')->nullable()->after('estado');
                $table->string('ip_salida')->nullable()->after('ip_entrada');
                $table->timestamp('hora_entrada_dispositivo')->nullable()->after('hora_entrada');
                $table->timestamp('hora_salida_dispositivo')->nullable()->after('hora_salida');
            }
        });

        Schema::table('pausas', function (Blueprint $table) {
            if (!Schema::hasColumn('pausas','ip_inicio')) {
                $table->string('ip_inicio')->nullable()->after('tipo');
                $table->string('ip_fin')->nullable()->after('ip_inicio');
                $table->timestamp('hora_inicio_dispositivo')->nullable()->after('hora_inicio');
                $table->timestamp('hora_fin_dispositivo')->nullable()->after('hora_fin');
                $table->boolean('es_computable')->default(false)->after('duracion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('jornadas', function (Blueprint $table) {
            $table->dropColumn(['ip_entrada','ip_salida','hora_entrada_dispositivo','hora_salida_dispositivo']);
        });
        Schema::table('pausas', function (Blueprint $table) {
            $table->dropColumn(['ip_inicio','ip_fin','hora_inicio_dispositivo','hora_fin_dispositivo','es_computable']);
        });
    }
};
