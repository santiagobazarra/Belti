<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Cambiar tipo de time a timestamp usando SQL directo para PostgreSQL
        // Combinamos la fecha con la hora para crear un timestamp completo
        DB::statement('ALTER TABLE incidencias 
            ALTER COLUMN hora_inicio TYPE timestamp(0) without time zone 
            USING CASE 
                WHEN hora_inicio IS NOT NULL AND fecha IS NOT NULL 
                THEN (fecha + hora_inicio)::timestamp(0) without time zone 
                ELSE NULL 
            END');
        
        DB::statement('ALTER TABLE incidencias 
            ALTER COLUMN hora_fin TYPE timestamp(0) without time zone 
            USING CASE 
                WHEN hora_fin IS NOT NULL AND fecha IS NOT NULL 
                THEN (fecha + hora_fin)::timestamp(0) without time zone 
                ELSE NULL 
            END');
        
        // Migrar estados antiguos a nuevos
        DB::table('incidencias')->where('estado','resuelta')->update(['estado'=>'aprobada']);
        DB::table('incidencias')->where('estado','revisada')->update(['estado'=>'pendiente']);
    }

    public function down(): void
    {
        // Revertir tipos de timestamp a time usando SQL directo para PostgreSQL
        DB::statement('ALTER TABLE incidencias 
            ALTER COLUMN hora_inicio TYPE time 
            USING CASE 
                WHEN hora_inicio IS NOT NULL 
                THEN hora_inicio::time 
                ELSE NULL 
            END');
        
        DB::statement('ALTER TABLE incidencias 
            ALTER COLUMN hora_fin TYPE time 
            USING CASE 
                WHEN hora_fin IS NOT NULL 
                THEN hora_fin::time 
                ELSE NULL 
            END');
        
        DB::table('incidencias')->where('estado','aprobada')->update(['estado'=>'resuelta']);
    }
};
