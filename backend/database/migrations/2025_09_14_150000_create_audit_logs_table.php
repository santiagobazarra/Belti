<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->string('action'); // created, updated, deleted
            $table->json('changes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['model_type','model_id']);
            $table->index('id_usuario');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
