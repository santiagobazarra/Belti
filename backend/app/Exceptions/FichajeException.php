<?php
namespace App\Exceptions;

use Exception;

class FichajeException extends Exception
{
    public function __construct(string $message, public int $status = 422)
    {
        parent::__construct($message, $status);
    }
}
