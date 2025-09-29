<?php
namespace App\Exceptions;

use Exception;

class IncidenciaException extends Exception
{
    public function __construct(string $message, public readonly string $codeKey = 'INCIDENCIA_ERROR', int $code = 0)
    {
        parent::__construct($message, $code);
    }
}
