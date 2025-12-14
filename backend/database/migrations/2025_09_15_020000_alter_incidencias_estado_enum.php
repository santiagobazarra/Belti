<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Para PostgreSQL, Laravel crea tipos ENUM con nombres específicos
        // Primero, eliminar el constraint/check antiguo si existe
        DB::statement("ALTER TABLE incidencias DROP CONSTRAINT IF EXISTS incidencias_estado_check");
        
        // Eliminar el valor por defecto antes de cambiar el tipo
        DB::statement("ALTER TABLE incidencias ALTER COLUMN estado DROP DEFAULT");
        
        // Crear el nuevo tipo ENUM si no existe
        DB::statement("DO $$ BEGIN
            CREATE TYPE incidencias_estado_new AS ENUM ('pendiente','aprobada','rechazada');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;");
        
        // Cambiar la columna para usar el nuevo tipo
        // Primero convertir los valores antiguos: 'revisada' y 'resuelta' -> 'pendiente' y 'aprobada'
        DB::statement("UPDATE incidencias SET estado = 'aprobada' WHERE estado = 'resuelta'");
        DB::statement("UPDATE incidencias SET estado = 'pendiente' WHERE estado = 'revisada'");
        
        // Cambiar el tipo de la columna
        DB::statement("ALTER TABLE incidencias 
            ALTER COLUMN estado TYPE incidencias_estado_new 
            USING estado::text::incidencias_estado_new");
        
        // Establecer el valor por defecto después de cambiar el tipo
        DB::statement("ALTER TABLE incidencias 
            ALTER COLUMN estado SET DEFAULT 'pendiente'::incidencias_estado_new");
        
        // Renombrar el tipo para que coincida con el nombre esperado
        DB::statement("DROP TYPE IF EXISTS incidencias_estado_old CASCADE");
    }
    
    public function down(): void
    {
        // Crear el tipo ENUM antiguo
        DB::statement("DO $$ BEGIN
            CREATE TYPE incidencias_estado_old AS ENUM ('pendiente','revisada','resuelta','rechazada');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;");
        
        // Cambiar la columna de vuelta
        DB::statement("ALTER TABLE incidencias 
            ALTER COLUMN estado TYPE incidencias_estado_old 
            USING estado::text::incidencias_estado_old");
        
        DB::statement("ALTER TABLE incidencias 
            ALTER COLUMN estado SET DEFAULT 'pendiente'::incidencias_estado_old");
        
        // Eliminar el tipo nuevo
        DB::statement("DROP TYPE IF EXISTS incidencias_estado_new CASCADE");
    }
};
