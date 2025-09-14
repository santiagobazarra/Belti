<?php

namespace App\Providers;

use App\Models\Incidencia;
use App\Models\Solicitud;
use App\Policies\IncidenciaPolicy;
use App\Policies\SolicitudPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Incidencia::class => IncidenciaPolicy::class,
        Solicitud::class => SolicitudPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
