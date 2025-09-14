<?php
namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function($model){
            $model->storeAudit('created', $model->getAttributes(), []);
        });
        static::updated(function($model){
            $changes = $model->getChanges();
            unset($changes['updated_at']);
            if(!empty($changes)){
                $original = [];
                foreach(array_keys($changes) as $k){
                    $original[$k] = $model->getOriginal($k);
                }
                $model->storeAudit('updated', $changes, $original);
            }
        });
        static::deleted(function($model){
            $model->storeAudit('deleted', [], $model->getOriginal());
        });
    }

    protected function storeAudit(string $action, array $new, array $old)
    {
        try {
            AuditLog::create([
                'id_usuario' => Auth::id(),
                'model_type' => static::class,
                'model_id' => $this->getKey(),
                'action' => $action,
                'changes' => [
                    'new' => $new,
                    'old' => $old,
                ],
            ]);
        } catch (\Throwable $e) {
            // swallow to not break main flow
        }
    }
}
