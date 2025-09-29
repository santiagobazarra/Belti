<?php

namespace App\Http\Controllers;

use App\Models\TipoPausa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class TipoPausaController extends Controller
{
    public function index(): JsonResponse
    {
        $tipos = TipoPausa::activos()->ordenados()->get();
        return response()->json(['data' => $tipos]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:tipos_pausa,nombre',
            'descripcion' => 'nullable|string',
            'es_computable' => 'boolean',
            'minutos_computable_maximo' => 'nullable|integer|min:1|max:480',
            'max_usos_dia' => 'nullable|integer|min:1|max:20',
            'orden' => 'integer|min:0'
        ]);

        $tipo = TipoPausa::create($validated);
        return response()->json($tipo, 201);
    }

    public function show(TipoPausa $tipoPausa): JsonResponse
    {
        return response()->json($tipoPausa);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $tipoPausa = TipoPausa::findOrFail($id);

        try {
            $validated = $request->validate([
                'nombre' => ['required', 'string', 'max:255', Rule::unique('tipos_pausa', 'nombre')->ignore($id)],
                'descripcion' => 'nullable|string',
                'es_computable' => 'required|boolean',
                'minutos_computable_maximo' => 'nullable|integer|min:1|max:480',
                'max_usos_dia' => 'nullable|integer|min:1|max:20',
                'activo' => 'boolean',
                'orden' => 'integer|min:0'
            ]);

            $tipoPausa->update($validated);
            return response()->json($tipoPausa);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function destroy($id): JsonResponse
    {
        $tipoPausa = TipoPausa::findOrFail($id);

        // En lugar de eliminar, desactivamos
        $tipoPausa->update(['activo' => false]);

        return response()->json([
            'deleted' => true,
            'resource' => 'tipo_pausa',
            'id' => $tipoPausa->id,
            'message' => 'Tipo de pausa desactivado',
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Obtener tipos de pausa disponibles para un usuario
     */
    public function disponibles(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $hoy = now()->toDateString();

        $tipos = TipoPausa::activos()->ordenados()->get();

        // Contar usos de hoy por tipo para el usuario
        $usosPorTipo = [];
        if ($userId) {
            $usos = \DB::table('pausas')
                ->join('jornadas', 'pausas.id_jornada', '=', 'jornadas.id_jornada')
                ->select('pausas.id_tipo_pausa', \DB::raw('COUNT(*) as total'))
                ->where('jornadas.id_usuario', $userId)
                ->whereDate('jornadas.fecha', $hoy)
                ->whereNotNull('pausas.hora_fin')
                ->whereNotNull('pausas.id_tipo_pausa')
                ->groupBy('pausas.id_tipo_pausa')
                ->pluck('total', 'id_tipo_pausa')
                ->toArray();
            $usosPorTipo = $usos;
        }

        // Filtrar tipos disponibles según límites de uso
        $tiposDisponibles = $tipos->filter(function ($tipo) use ($usosPorTipo) {
            if (!$tipo->max_usos_dia) {
                return true; // Sin límite
            }

            $usosHoy = $usosPorTipo[$tipo->id] ?? 0;
            return $usosHoy < $tipo->max_usos_dia;
        });

        return response()->json([
            'data' => $tiposDisponibles->values(),
            'usos_hoy' => $usosPorTipo
        ]);
    }
}
