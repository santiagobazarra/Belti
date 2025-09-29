<?php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('jornadas:cerrar-abiertas')->dailyAt('00:05');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    // Aquí se pueden requerir archivos adicionales si fuese necesario
    }
}
