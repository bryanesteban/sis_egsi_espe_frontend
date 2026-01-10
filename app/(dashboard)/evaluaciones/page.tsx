'use client';

import { ClipboardCheck, Plus, Search, Filter } from 'lucide-react';

export default function EvaluacionesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            Evaluaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las evaluaciones de seguridad
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
          <Plus className="w-5 h-5" />
          Nueva Evaluación
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar evaluaciones..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors">
          <Filter className="w-5 h-5" />
          Filtrar
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-12">
          <ClipboardCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay evaluaciones registradas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comienza creando tu primera evaluación de seguridad
          </p>
        </div>
      </div>
    </div>
  );
}
