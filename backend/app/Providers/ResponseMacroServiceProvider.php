<?php
namespace App\Providers;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class ResponseMacroServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Response::macro('success', function ($data = null, int $status = 200, array $meta = []) {
            if ($data instanceof LengthAwarePaginator) {
                $payload = [
                    'success' => true,
                    'data' => $data->items(),
                    'meta' => array_merge([
                        'total' => $data->total(),
                        'per_page' => $data->perPage(),
                        'current_page' => $data->currentPage(),
                        'last_page' => $data->lastPage(),
                    ], $meta),
                ];
                return Response::json($payload, $status);
            }
            return Response::json([
                'success' => true,
                'data' => $data,
                'meta' => (object) $meta,
            ], $status);
        });

        Response::macro('error', function (string $message, int $status = 400, ?string $code = null, $errors = null) {
            $payload = [
                'success' => false,
                'error' => [
                    'message' => $message,
                ],
            ];
            if ($code !== null) $payload['error']['code'] = $code;
            if ($errors !== null) $payload['error']['details'] = $errors;
            return Response::json($payload, $status);
        });
    }
}
