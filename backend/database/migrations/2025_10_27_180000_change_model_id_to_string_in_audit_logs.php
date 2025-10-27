<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Cambiar model_id de unsignedBigInteger a string para soportar IDs de reportes
            $table->string('model_id')->change();
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Revertir a unsignedBigInteger
            $table->unsignedBigInteger('model_id')->change();
        });
    }
};
