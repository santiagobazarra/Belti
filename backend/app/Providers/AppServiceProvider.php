<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        // Establecer zona horaria desde configuración de empresa si está disponible
        try {
            $tz = \App\Models\ConfigEmpresa::where('clave','zona_horaria')->value('valor');
            if ($tz) { date_default_timezone_set($tz); }
        } catch (\Throwable $e) {
            // Ignorar durante instalaciones o antes de migraciones
        }
    }
}
