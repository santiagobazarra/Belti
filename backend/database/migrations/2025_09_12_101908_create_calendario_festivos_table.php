<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('calendario_festivos', function (Blueprint $table) {
            $table->id('id_festivo');
            $table->date('fecha');
            $table->string('descripcion');
            $table->string('tipo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendario_festivos');
    }
};
