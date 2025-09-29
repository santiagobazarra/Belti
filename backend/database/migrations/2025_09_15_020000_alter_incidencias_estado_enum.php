<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Ajustar enum directamente (MySQL) - asumiendo campo estado es VARCHAR/ENUM previo
        DB::statement("ALTER TABLE incidencias MODIFY estado ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente'");
    }
    public function down(): void
    {
        DB::statement("ALTER TABLE incidencias MODIFY estado ENUM('pendiente','revisada','resuelta','rechazada') NOT NULL DEFAULT 'pendiente'");
    }
};
