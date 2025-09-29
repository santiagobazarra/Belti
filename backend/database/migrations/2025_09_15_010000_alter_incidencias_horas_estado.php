<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('incidencias', function (Blueprint $table) {
            $table->dateTime('hora_inicio')->nullable()->change();
            $table->dateTime('hora_fin')->nullable()->change();
        });
        // Migrar estados antiguos a nuevos
        DB::table('incidencias')->where('estado','resuelta')->update(['estado'=>'aprobada']);
        DB::table('incidencias')->where('estado','revisada')->update(['estado'=>'pendiente']);
    }

    public function down(): void
    {
        // revertir tipos a time
        Schema::table('incidencias', function (Blueprint $table) {
            $table->time('hora_inicio')->nullable()->change();
            $table->time('hora_fin')->nullable()->change();
        });
        DB::table('incidencias')->where('estado','aprobada')->update(['estado'=>'resuelta']);
    }
};
