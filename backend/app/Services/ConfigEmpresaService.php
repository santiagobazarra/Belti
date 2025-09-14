<?php
namespace App\Services;

use App\Models\ConfigEmpresa;
use Illuminate\Support\Facades\Cache;

class ConfigEmpresaService
{
    private const CACHE_KEY = 'config_empresa_cache_v1';
    private const TTL = 3600; // 1h

    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY,self::TTL,function(){
            return ConfigEmpresa::query()->pluck('valor','clave')->toArray();
        });
    }

    public function get(string $clave, mixed $default=null): mixed
    {
        $all = $this->all();
        return $all[$clave] ?? $default;
    }

    public function set(array $pairs): array
    {
        foreach($pairs as $k=>$v){
            ConfigEmpresa::updateOrCreate(['clave'=>$k],['valor'=>(string)$v]);
        }
        Cache::forget(self::CACHE_KEY);
        return $this->all();
    }
}
